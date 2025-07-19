import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Section {
  title: string;
  body: string;
}

interface VenueDescriptionProps {
  sections?: Section[];
}

export default function VenueDescription({ sections }: VenueDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Filter out sections with no body content
  const validSections = sections?.filter(section => section && section.body && section.body.trim() !== '') || [];
  
  if (validSections.length === 0) {
    return null;
  }

  // Calculate if content is long enough to need collapsing
  const totalLength = validSections.reduce((sum, section) => {
    if (!section || !section.body) return sum;
    return sum + section.body.length;
  }, 0);
  const needsCollapse = totalLength > 200 || validSections.length > 1; // Lower threshold and check section count
  
  console.log('VenueDescription - totalLength:', totalLength, 'sections:', validSections.length, 'needsCollapse:', needsCollapse);

  const displaySections = needsCollapse && !isExpanded 
    ? validSections.slice(0, 1).map(section => ({
        ...section,
        body: section.body && section.body.length > 150 
          ? section.body.substring(0, 150) + '...' 
          : section.body || ''
      }))
    : validSections;

  return (
    <div className="relative">
      <div className="space-y-4">
        {displaySections.map((section, index) => (
          <div key={index}>
            <h3 className="font-semibold text-white text-base mb-2">
              {section.title}
            </h3>
            <p className="text-white/80 text-sm leading-relaxed">
              {section.body}
            </p>
          </div>
        ))}
      </div>
      
      {needsCollapse && (
        <div className="flex justify-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <ChevronUp size={20} className="text-white/60" />
            ) : (
              <ChevronDown size={20} className="text-white/60" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}