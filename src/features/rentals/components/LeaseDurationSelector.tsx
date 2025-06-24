import React from 'react';

interface LeaseDurationSelectorProps {
  selectedDuration: string;
  onDurationSelect: (duration: string) => void;
  className?: string;
  showNegotiable?: boolean;
}

const LEASE_DURATION_OPTIONS = [
  '1-3 months',
  '3-6 months',
  '6-12 months',
  '1 year+',
];

const LeaseDurationSelector: React.FC<LeaseDurationSelectorProps> = ({
  selectedDuration,
  onDurationSelect,
  className = '',
  showNegotiable = false
}) => {
  const options = showNegotiable 
    ? [...LEASE_DURATION_OPTIONS, 'Negotiable']
    : LEASE_DURATION_OPTIONS;

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 gap-2 ${className}`}>
      {options.map((duration) => (
        <button
          key={duration}
          onClick={() => onDurationSelect(duration)}
          className={`h-8 px-4 rounded-full transition-all duration-200 text-sm w-full ${
            duration === 'Negotiable' ? 'col-span-2 sm:col-span-3' : ''
          } ${
            selectedDuration === duration
              ? 'bg-white text-gray-800'
              : 'bg-white/10 text-white/70 hover:bg-white/15'
          }`}
        >
          {duration}
        </button>
      ))}
    </div>
  );
};

export default LeaseDurationSelector;