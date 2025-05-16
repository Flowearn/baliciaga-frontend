import React from 'react';
import { Check, Clock } from "lucide-react";
import { type Cafe } from '../services/cafeService';

type CafeCardProps = Cafe;

const CafeCard: React.FC<CafeCardProps> = ({ 
  name, 
  address,
  photos,
  openingHours,
  isOpenNow,
  rating,
  userRatingsTotal,
  priceLevel
}) => {
  // Generate random gradient class name to replace the original gradientClass
  const gradientClasses = [
    'bg-gradient-to-r from-blue-500 to-purple-500',
    'bg-gradient-to-r from-green-500 to-teal-500',
    'bg-gradient-to-r from-yellow-500 to-orange-500',
    'bg-gradient-to-r from-pink-500 to-red-500'
  ];
  
  const gradientClass = gradientClasses[Math.floor(Math.random() * gradientClasses.length)];
  
  // Get price level display using $ symbols with improved visual distinction
  const getPriceLevelDisplay = (level: number) => {
    if (level <= 0 || level === -1) return null;
    
    const maxLevel = 4;
    const filledCount = Math.min(level, maxLevel);
    const emptyCount = maxLevel - filledCount;
    
    return (
      <span className="flex items-center">
        {[...Array(filledCount)].map((_, index) => (
          <span key={`filled-${index}`} className="text-yellow-500 opacity-100">$</span>
        ))}
        {[...Array(emptyCount)].map((_, index) => (
          <span key={`empty-${index}`} className="text-gray-300 opacity-40">$</span>
        ))}
      </span>
    );
  };

  // Get opening hours display
  const getOpeningTime = () => {
    // If we have opening hours data, extract today's hours
    if (openingHours && openingHours.length > 0) {
      const today = new Date().getDay();
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const todayStr = days[today];
      
      const todayHours = openingHours.find(hour => hour.startsWith(todayStr));
      if (todayHours) {
        return todayHours.split(': ')[1];
      }
    }
    return 'Hours unavailable';
  };

  // Get image URL
  const imageUrl = photos && photos.length > 0 
    ? photos[0] 
    : 'https://via.placeholder.com/400x300?text=No+Image';

  // Price level display JSX
  const priceDisplay = getPriceLevelDisplay(priceLevel);

  return (
    <div className="w-full mb-6">
      <div className={`${gradientClass} w-full h-64 rounded-xl relative overflow-hidden flex flex-col justify-end p-5`}>
        {/* Image as background */}
        <div className="absolute inset-0">
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
          {/* Add a semi-transparent layer to make text more visible */}
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        </div>
        
        {/* Title in the card image (bottom-left corner) */}
        <div className="absolute bottom-5 left-5 z-10">
          <h1 className="text-2xl font-bold text-white drop-shadow-md">{name}</h1>
        </div>
        
        {/* Smaller Open Now badge */}
        {isOpenNow && (
          <div className="absolute top-5 right-5 z-10">
            <div className="bg-green-500 bg-opacity-90 text-white text-xs px-2 py-0.5 rounded-full flex items-center">
              <Check size={12} className="mr-1" />
              <span>Open Now</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Info section with reduced top margin */}
      <div className="flex flex-col mt-2">
        {/* First row: Opening hours + Price level */}
        <div className="flex justify-between items-center">
          <span className="inline-flex items-center text-gray-500 text-sm">
            <Clock className="w-4 h-4 mr-1" />
            {getOpeningTime()}
          </span>
          
          {priceDisplay && (
            <div className="text-sm font-medium">
              {priceDisplay}
            </div>
          )}
        </div>
        
        {/* Second row: Rating */}
        <div className="flex items-center mt-1">
          <div className="text-sm flex items-center text-gray-500">
            <span className="text-yellow-500 mr-1">⭐</span>
            <span className="font-medium">{rating.toFixed(1)}/5</span>
            <span className="ml-1">({userRatingsTotal})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CafeCard;
