import React from 'react';
import { useThemeStore } from '@/stores/useThemeStore';

export const RegionalFilterBar: React.FC = () => {
  // Subscribe to the immersive theme state
  const activeTheme = useThemeStore((state) => state.activeTheme);
  
  return (
    <div className="py-0 px-2 sm:px-4">
      <div className="flex flex-wrap items-center gap-x-6 sm:gap-x-10 gap-y-2 justify-center">
        {/* Canggu - Active/Default */}
        <button
          className="relative py-2 px-2 sm:px-3 text-xs sm:text-sm text-brand transition-colors duration-200 ease-in-out group"
        >
          <span className="relative">
            Canggu
            <span className="absolute -bottom-2 -left-2 -right-2 h-0.5 bg-brand"></span>
          </span>
        </button>
        
        {/* Seminyak - Coming Soon */}
        <button
          className="relative py-2 px-2 sm:px-3 text-xs sm:text-sm text-gray-400 transition-colors duration-200 ease-in-out opacity-50 cursor-not-allowed"
          disabled={true}
        >
          <span className="relative">
            Seminyak (Coming Soon)
            <span className="absolute -bottom-2 -left-2 -right-2 h-0.5 bg-transparent"></span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default RegionalFilterBar;