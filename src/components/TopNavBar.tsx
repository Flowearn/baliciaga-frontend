import React from 'react';
import { NavLink } from 'react-router-dom';
import { useThemeStore } from '@/stores/useThemeStore';

export const TopNavBar = () => {
  // Subscribe to the immersive theme state
  const activeTheme = useThemeStore((state) => state.activeTheme);
  
  return (
    <div className="pt-0 pb-2 px-2 sm:px-4">
      <div className="flex justify-between items-center w-full max-w-4xl mx-auto">
        <NavLink
          to="/my-listings"
          className={({ isActive }) => `flex-1 text-center relative py-1 sm:py-2 px-2 sm:px-3 text-xs sm:text-sm transition-colors duration-200 ease-in-out whitespace-nowrap ${
            isActive
              ? activeTheme ? 'text-white' : 'text-brand'
              : activeTheme ? 'text-white/70 hover:text-white' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {({ isActive }) => (
            <span className="relative inline-block">
              My Listings
              <span className={`absolute -bottom-1 sm:-bottom-2 left-0 right-0 h-0.5 transition-colors duration-200 ${
                isActive 
                  ? activeTheme ? 'bg-white' : 'bg-brand' 
                  : 'bg-transparent'
              }`}></span>
            </span>
          )}
        </NavLink>
        
        <NavLink
          to="/my-applications"
          className={({ isActive }) => `flex-1 text-center relative py-1 sm:py-2 px-2 sm:px-3 text-xs sm:text-sm transition-colors duration-200 ease-in-out whitespace-nowrap ${
            isActive
              ? activeTheme ? 'text-white' : 'text-brand'
              : activeTheme ? 'text-white/70 hover:text-white' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {({ isActive }) => (
            <span className="relative inline-block">
              My Applications
              <span className={`absolute -bottom-1 sm:-bottom-2 left-0 right-0 h-0.5 transition-colors duration-200 ${
                isActive 
                  ? activeTheme ? 'bg-white' : 'bg-brand' 
                  : 'bg-transparent'
              }`}></span>
            </span>
          )}
        </NavLink>
        
        <NavLink
          to="/listings"
          end
          className={({ isActive }) => `flex-1 text-center relative py-1 sm:py-2 px-2 sm:px-3 text-xs sm:text-sm transition-colors duration-200 ease-in-out whitespace-nowrap ${
            isActive
              ? activeTheme ? 'text-white' : 'text-brand'
              : activeTheme ? 'text-white/70 hover:text-white' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {({ isActive }) => (
            <span className="relative inline-block">
              All Listings
              <span className={`absolute -bottom-1 sm:-bottom-2 left-0 right-0 h-0.5 transition-colors duration-200 ${
                isActive 
                  ? activeTheme ? 'bg-white' : 'bg-brand' 
                  : 'bg-transparent'
              }`}></span>
            </span>
          )}
        </NavLink>
      </div>
    </div>
  );
};

export default TopNavBar;