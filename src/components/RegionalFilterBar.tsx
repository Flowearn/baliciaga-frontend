import React from 'react';

export const RegionalFilterBar: React.FC = () => {
  return (
    <div className="py-0 px-4">
      <div className="flex gap-10 justify-center">
        {/* Canggu - Active/Default */}
        <button
          className="relative py-2 px-3 text-sm text-brand transition-colors duration-200 ease-in-out group"
        >
          <span className="relative">
            Canggu
            <span className="absolute -bottom-2 -left-2 -right-2 h-0.5 bg-brand"></span>
          </span>
        </button>
        
        {/* Ubud - Coming Soon */}
        <button
          className="relative py-2 px-3 text-sm text-gray-400 transition-colors duration-200 ease-in-out opacity-50 cursor-not-allowed"
          disabled={true}
        >
          <span className="relative">
            Ubud (Coming Soon)
            <span className="absolute -bottom-2 -left-2 -right-2 h-0.5 bg-transparent"></span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default RegionalFilterBar;