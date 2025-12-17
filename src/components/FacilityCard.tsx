import { ExternalLink, MapPin, MailIcon, PhoneCallIcon, Clock } from 'lucide-react';
import type { Facility } from '../types/recycleiq';

interface FacilityCardProps {
  facility: Facility;
}

function stripLinks(text: string): string {
  if (!text) return '';

  let s = String(text);

  // 1. Heavy-duty match for: ([label](url)) 
  // This looks for a ( followed by [something] followed by (anything until the last matching parenthesis)
  // The [\s\S]*? allows it to jump over newlines.
  s = s.replace(/\(\s*\[[^\]]+\]\s*\([\s\S]*?\)\s*\)/g, '');

  // 2. Heavy-duty match for standard markdown: [label](url)
  s = s.replace(/\[[^\]]+\]\s*\([\s\S]*?\)/g, '');

  // 3. Remove any remaining standalone URLs (even with query params)
  s = s.replace(/https?:\/\/[^\s)]+/g, '');

  // 4. Remove angle brackets <url>
  s = s.replace(/<[^>]+>/g, '');

  // 5. Cleanup citations like [1] or [cite...]
  s = s.replace(/\[\s*cite[^\]]*\]/gi, '');
  s = s.replace(/\[\d+\]/g, '');

  // Final Cleanup
  return s
    .replace(/\(\s*\)/g, '')         // Remove leftover empty parens
    .replace(/[ \t]+\n/g, '\n')      // Remove trailing whitespace
    .replace(/\n{3,}/g, '\n\n')      // Collapse extra newlines
    .replace(/[ \t]{2,}/g, ' ')      // Collapse extra spaces
    .trim();
}

export default function FacilityCard({ facility }: FacilityCardProps) {
  return (
    <div className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 mb-1">{facility.name}</h4>
           <div className="flex items-start gap-1 text-sm text-gray-600 mb-2">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span>{facility.address}</span>
           </div>

            {facility.email && (
            <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
            <MailIcon className="w-4 h-4 flex-shrink-0" />
            <span>{facility.email}</span>
          </div>)}
          {facility.hours && (
            <div className="flex items-start gap-1 text-sm text-gray-600 mb-2">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span>{facility.hours}</span>
          </div>)}
          {facility.phone && (
            <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
            <PhoneCallIcon className="w-4 h-4 flex-shrink-0" />
            <span>{facility.phone}</span>
          </div>)}
        </div>
        {facility.url && facility.url !== '#' && (
          <a
            href={facility.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:text-green-700 transition-colors"
            aria-label={`Visit ${facility.name}`}
          >
            <ExternalLink className="w-5 h-5" />
          </a>
        )}
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
          {facility.type}
        </span>
      </div>
      {facility.notes && (
        <p className="text-sm text-gray-600 leading-relaxed">{stripLinks(facility.notes)}</p>
      )}
    </div>
  );
}

