import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Globe } from 'lucide-react';

interface SourcesPanelProps {
  ragSources?: string[];
  webSearchSources?: string[];
  ragQueried?: boolean;
}

export default function SourcesPanel({ ragSources, webSearchSources, ragQueried }: SourcesPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if we have any sources to display
  const hasRagSources = ragQueried && ragSources && ragSources.length > 0;
  const hasWebSources = webSearchSources && webSearchSources.length > 0;
  const hasAnySources = hasRagSources || hasWebSources;

  // Don't render if no sources
  if (!hasAnySources) {
    return null;
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300">
      {/* Header - Always visible */}
      <button
        onClick={toggleExpanded}
        className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-medium text-gray-900">Sources</h3>
          <span className="text-sm text-gray-500">
            ({(() => {
              const counts: number[] = [];
              if (hasRagSources) counts.push(ragSources!.length);
              if (hasWebSources) counts.push(webSearchSources!.length);
              return counts.join(' + ');
            })()})
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Content - Expandable */}
      <div
        className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
          }`}
      >
        <div className="px-8 pb-8 space-y-6">
          {/* RAG Sources Section */}
          {hasRagSources && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-gray-500" />
                <h4 className="text-sm font-medium text-gray-700">RAG Sources</h4>
              </div>
              <ul className="space-y-2">
                {ragSources!.map((source, index) => (
                  <li key={index}>
                    <a
                      href={source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-green-600 hover:text-green-700 hover:underline break-all"
                    >
                      {source}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Web Search Sources Section */}
          {hasWebSources && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Globe className="w-4 h-4 text-gray-500" />
                <h4 className="text-sm font-medium text-gray-700">Web Search Sources</h4>
              </div>
              <ul className="space-y-2">
                {webSearchSources!.map((source, index) => (
                  <li key={index}>
                    <a
                      href={source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-green-600 hover:text-green-700 hover:underline break-all"
                    >
                      {source}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

