import React from 'react';
import { NavLink } from 'react-router-dom';
import { useThemeStore } from '@/stores/useThemeStore';

export const TopNavBar = () => {
  // Subscribe to the immersive theme state
  const activeTheme = useThemeStore((state) => state.activeTheme);
  
  return (
    <div className="pt-0 pb-2 px-4">
      <div className="flex gap-10 justify-center">
        <NavLink
          to="/my-listings"
          className={({ isActive }) => `relative py-2 px-3 text-sm transition-colors duration-200 ease-in-out whitespace-nowrap ${
            isActive
              ? activeTheme ? 'text-white' : 'text-brand'
              : activeTheme ? 'text-white/70 hover:text-white' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {({ isActive }) => (
            <span className="relative">
              My Listings
              <span className={`absolute -bottom-2 -left-2 -right-2 h-0.5 transition-colors duration-200 ${
                isActive 
                  ? activeTheme ? 'bg-white' : 'bg-brand' 
                  : 'bg-transparent'
              }`}></span>
            </span>
          )}
        </NavLink>
        
        <NavLink
          to="/my-applications"
          className={({ isActive }) => `relative py-2 px-3 text-sm transition-colors duration-200 ease-in-out whitespace-nowrap ${
            isActive
              ? activeTheme ? 'text-white' : 'text-brand'
              : activeTheme ? 'text-white/70 hover:text-white' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {({ isActive }) => (
            <span className="relative">
              My Applications
              <span className={`absolute -bottom-2 -left-2 -right-2 h-0.5 transition-colors duration-200 ${
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
          className={({ isActive }) => `relative py-2 px-3 text-sm transition-colors duration-200 ease-in-out whitespace-nowrap ${
            isActive
              ? activeTheme ? 'text-white' : 'text-brand'
              : activeTheme ? 'text-white/70 hover:text-white' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {({ isActive }) => (
            <span className="relative">
              All Listings
              <span className={`absolute -bottom-2 -left-2 -right-2 h-0.5 transition-colors duration-200 ${
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