import React from 'react';
import { Check } from "lucide-react";
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
  
  // Get price level display
  const getPriceLevel = (level: number) => {
    if (level === -1) return 'N/A';
    return '₨'.repeat(level);
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
          <h1 className="text-2xl font-bold text-white">{name}</h1>
        </div>
        
        {isOpenNow && (
          <div className="absolute top-5 right-5 z-10">
            <div className="bg-green-500 bg-opacity-90 text-white text-sm px-3 py-1 rounded-full flex items-center">
              <Check size={16} className="mr-1" />
              <span>Open Now</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex flex-col mt-3">
        <h2 className="text-lg font-bold">{name}</h2>
        
        <div className="flex items-center text-gray-500 mt-2">
          <span className="inline-flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {getOpeningTime()}
          </span>
        </div>
        
        <div className="flex justify-between mt-2">
          <div className="text-sm">
            <span className="mr-1">⭐</span>
            <span className="font-medium">{rating.toFixed(1)}/5</span>
            <span className="text-gray-500 ml-1">({userRatingsTotal})</span>
          </div>
          
          <div className="text-sm font-medium text-green-600">
            {getPriceLevel(priceLevel)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CafeCard;
