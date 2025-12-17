// src/hooks/useAnalyzeItem.ts
import { useCallback, useState } from 'react';
import type { AnalyzeResponse } from '../types/recycleiq';

type Stage =
  | 'idle'
  | 'analyzing-vision'
  | 'querying-rag'
  | 'analyzing-recyclability'
  | 'geocoding'
  | 'complete'
  | 'error';

export interface AnalyzeRequest {
  image?: string; // base64 data URL (optional)
  location: string; // required
  context?: string; // optional
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

function stripLinks(text: string): string {
  if (!text) return '';

  let s = String(text);

  // 1. Remove the specific ([text](url)) pattern (common in LLM citations)
  // This matches a literal '(', then a markdown link '[...](...)', then a literal ')'
  s = s.replace(/\(\s*\[[^\]]+\]\([^)]+\)\s*\)/g, '');

  // 2. Remove standard markdown links [text](url)
  s = s.replace(/\[[^\]]+\]\([^)]+\)/g, '');

  // 3. Remove angle-bracket URLs <https://...>
  s = s.replace(/<https?:\/\/[^>]+>/g, '');

  // 4. Remove any remaining bare URLs
  s = s.replace(/https?:\/\/[^\s)]+/g, '');

  // 5. Cleanup citations like [1], [cite...], or [turn...]
  s = s.replace(/\[\s*cite[^\]]*\]/gi, '');
  s = s.replace(/\[\d+\]/g, '');

  // Cleanup whitespace
  return s
    .replace(/\(\s*\)/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function sanitizeAnalysis(analysis: AnalyzeResponse): AnalyzeResponse {
  const KEEP_AS_IS_KEYS = new Set([
    'ragSources',
    'webSearchSources',
  ]);

  // keep facility.url so the external-link icon can still work.
  const KEEP_URL_KEYS = new Set(['url']);

  const walk = (value: any, key?: string): any => {
    if (value == null) return value;

    // keep known source arrays exactly
    if (key && KEEP_AS_IS_KEYS.has(key)) return value;

    if (typeof value === 'string') {
      // keep facility.url (and any field literally named "url") untouched
      if (key && KEEP_URL_KEYS.has(key)) return value;
      return stripLinks(value);
    }

    if (Array.isArray(value)) {
      return value.map((v) => walk(v));
    }

    if (typeof value === 'object') {
      const out: any = {};
      for (const [k, v] of Object.entries(value)) {
        // keep ragSources / webSearchSources untouched at any depth
        if (KEEP_AS_IS_KEYS.has(k)) {
          out[k] = v;
          continue;
        }
        // keep url fields untouched (primarily facility.url)
        if (KEEP_URL_KEYS.has(k)) {
          out[k] = v;
          continue;
        }
        out[k] = walk(v, k);
      }
      return out;
    }

    return value;
  };

  return walk(analysis) as AnalyzeResponse;
}

export function useAnalyzeItem() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>('idle');

  const [data, setData] = useState<AnalyzeResponse | null>(null);
  const [visionData, setVisionData] = useState<any | null>(null);

  const analyze = useCallback(async (payload: AnalyzeRequest) => {
    setError(null);
    setLoading(true);
    setStage('analyzing-vision');
    setData(null);
    setVisionData(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Request failed (${res.status})`);
      }

      setStage('querying-rag');
      const json = await res.json();

      const rawAnalysis: AnalyzeResponse = (json?.analysis ?? json) as AnalyzeResponse;

      const cleaned = sanitizeAnalysis(rawAnalysis);

      setStage('analyzing-recyclability');
      setData(cleaned);

      if (json?.visionData != null) {
        setVisionData(json.visionData);
      }

      setStage('geocoding');
      return cleaned;
    } catch (e) {
      setStage('error');
      setLoading(false);
      setError(getErrorMessage(e));
      throw e;
    }
  }, []);

  const complete = useCallback(() => {
    setStage('complete');
    setLoading(false);
  }, []);

  return {
    analyze,
    loading,
    error,
    data,
    stage,
    complete,
    visionData,
  };
}