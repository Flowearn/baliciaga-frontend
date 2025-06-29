import React from 'react';


interface FoodNavBarProps {
  selectedSubCategory: 'all' | 'cafe' | 'dining';
  onSubCategoryChange: (subCategory: 'all' | 'cafe' | 'dining') => void;
}

export const FoodNavBar: React.FC<FoodNavBarProps> = ({ selectedSubCategory, onSubCategoryChange }) => {
  return (
    <div className="pt-0 pb-2 px-4">
      <div className="flex gap-10 justify-center">
        <button
          onClick={() => onSubCategoryChange('all')}
          className={`relative py-2 px-3 text-sm transition-colors duration-200 ease-in-out ${
            selectedSubCategory === 'all'
              ? 'text-brand'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="relative">
            All
            <span className={`absolute -bottom-2 -left-2 -right-2 h-0.5 transition-colors duration-200 ${
              selectedSubCategory === 'all' ? 'bg-brand' : 'bg-transparent'
            }`}></span>
          </span>
        </button>
        
        <button
          onClick={() => onSubCategoryChange('cafe')}
          className={`relative py-2 px-3 text-sm transition-colors duration-200 ease-in-out ${
            selectedSubCategory === 'cafe'
              ? 'text-brand'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="relative">
            Cafe
            <span className={`absolute -bottom-2 -left-2 -right-2 h-0.5 transition-colors duration-200 ${
              selectedSubCategory === 'cafe' ? 'bg-brand' : 'bg-transparent'
            }`}></span>
          </span>
        </button>
        
        <button
          onClick={() => onSubCategoryChange('dining')}
          className={`relative py-2 px-3 text-sm transition-colors duration-200 ease-in-out ${
            selectedSubCategory === 'dining'
              ? 'text-brand'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="relative">
            Dining
            <span className={`absolute -bottom-2 -left-2 -right-2 h-0.5 transition-colors duration-200 ${
              selectedSubCategory === 'dining' ? 'bg-brand' : 'bg-transparent'
            }`}></span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default FoodNavBar;