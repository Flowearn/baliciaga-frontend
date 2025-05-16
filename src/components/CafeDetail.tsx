import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Phone, 
  Globe, 
  Star as StarOutline, 
  Sun, 
  FileText, 
  BookOpen, 
  Share2, 
  ChevronDown, 
  ChevronUp,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { type Cafe } from '../services/cafeService';

interface CafeDetailProps {
  cafe: Cafe;
  onClose: () => void;
}

const CafeDetail: React.FC<CafeDetailProps> = ({ cafe, onClose }) => {
  // State for expandable opening hours
  const [isOpeningHoursExpanded, setIsOpeningHoursExpanded] = useState(false);

  // Get price level display
  const getPriceLevel = (level: number) => {
    if (level === -1) return 'N/A';
    return 'u20a8'.repeat(level);
  };

  // Get random gradient background when no image is available
  const getGradientClass = () => {
    const gradients = [
      'bg-gradient-to-r from-blue-500 to-purple-500',
      'bg-gradient-to-r from-green-500 to-teal-500',
      'bg-gradient-to-r from-yellow-500 to-orange-500',
      'bg-gradient-to-r from-pink-500 to-red-500'
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  };

  // Get current day and format it
  const currentDay = useMemo(() => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[new Date().getDay()];
  }, []);

  // Get today's opening hours
  const todayOpeningHours = useMemo(() => {
    if (!cafe.openingHours || cafe.openingHours.length === 0) {
      return "Hours unavailable";
    }
    
    // Find the entry for today
    const dayEntry = cafe.openingHours.find(hours => 
      hours.toLowerCase().startsWith(currentDay.toLowerCase())
    );
    
    if (!dayEntry) {
      return "Hours unavailable";
    }
    
    // Extract the hours part from the entry (e.g., "Monday: 7:30 AM u2013 4:00 PM" -> "7:30 AM u2013 4:00 PM")
    const hoursMatch = dayEntry.match(/:\s*(.+)/);
    if (hoursMatch && hoursMatch[1]) {
      return hoursMatch[1].trim();
    }
    
    return "Closed today";
  }, [cafe.openingHours, currentDay]);

  // Build Google Maps Static API URL
  const getMapImageUrl = () => {
    // Get API key from environment variables
    const MAPS_API_KEY = import.meta.env.VITE_MAPS_API_KEY;
    
    if (!MAPS_API_KEY) {
      console.error("Google Maps API Key is missing!");
      return 'https://via.placeholder.com/600x300.png?text=Map+API+Key+Missing';
    }
    
    return `https://maps.googleapis.com/maps/api/staticmap?center=${cafe.latitude},${cafe.longitude}&zoom=15&size=600x300&maptype=roadmap&markers=color:red%7C${cafe.latitude},${cafe.longitude}&key=${MAPS_API_KEY}`;
  };

  // Get Google Maps URL for cafe using place_id parameter for more accurate location display
  const getGoogleMapsUrl = () => {
    if (cafe.placeId) {
      return `https://www.google.com/maps/place/?q=place_id:${cafe.placeId}`;
    } else {
      // Fallback to name and address search if place ID is unavailable
      const searchQuery = encodeURIComponent(`${cafe.name} ${cafe.address}`);
      return `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;
    }
  };

  // Handle Menu button click
  const handleMenuClick = () => {
    console.log("Menu button clicked for cafe:", cafe.placeId);
    alert("Menu feature coming soon!");
  };

  // Handle Share button click
  const handleShareClick = () => {
    const shareUrl = getGoogleMapsUrl();
    window.prompt("Copy this link to share:", shareUrl);
  };

  return (
    <div className="bg-neutral-700 max-h-[calc(100vh-2rem)] overflow-y-auto py-6 pb-16 w-full rounded-lg">
      {/* Floating Image Container */}
      <div className="floating-image-container mx-6 rounded-2xl overflow-hidden h-64 bg-gray-200">
        {cafe.photos && cafe.photos.length > 0 ? (
          <img 
            src={cafe.photos[0]} 
            alt={cafe.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`${getGradientClass()} w-full h-full`}></div>
        )}
      </div>
      
      {/* Floating Info Section - text directly floating without container */}
      <div className="floating-info-section mx-6 mt-4">
        <h1 className="cafe-title-main text-xl font-bold text-white">{cafe.name}</h1>
        <div className="cafe-rating-line flex items-center mt-2">
          {/* Replace with filled star icon */}
          <StarOutline size={16} className="text-yellow-500 mr-1" fill="currentColor" />
          <span className="text-white/70 text-sm">{cafe.rating.toFixed(1)}/5 ({cafe.userRatingsTotal})</span>
        </div>
      </div>
      
      {/* Floating Button Row */}
      <div className="floating-button-row mx-6 mt-8 flex space-x-3">
        {/* Active button - white background with dark text */}
        <button className="bg-white text-gray-800 px-4 py-2 rounded-full text-sm font-normal flex items-center">
          <FileText size={16} className="mr-2" />
          Info
        </button>
        {/* Inactive buttons - semi-transparent light background with white text */}
        <button 
          className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-full text-sm font-normal flex items-center"
          onClick={handleMenuClick}
        >
          <BookOpen size={16} className="mr-2" />
          Menu
        </button>
        <button 
          className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-full text-sm font-normal flex items-center"
          onClick={handleShareClick}
        >
          <Share2 size={16} className="mr-2" />
          Share
        </button>
      </div>
      
      {/* Unified Content Container with semi-transparent overlay */}
      <div className="content-area-container mx-6 mt-6 bg-neutral-900 bg-opacity-50 rounded-xl p-4 shadow-md">
        {/* Date/Hours/Weather Container */}
        <div className="datetime-weather-container relative z-10">
          <div className="flex justify-between items-center">
            {/* Left side: Date and Status */}
            <div className="flex items-center space-x-3">
              <h3 className="text-white/70 font-medium">{currentDay}</h3>
              
              {/* Open/Closed Status */}
              {cafe.isOpenNow ? (
                <div className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs flex items-center">
                  <CheckCircle2 size={12} className="mr-1" />
                  Open
                </div>
              ) : (
                <div className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs flex items-center">
                  <XCircle size={12} className="mr-1" />
                  Closed
                </div>
              )}
            </div>
            
            {/* Right side: Weather Info (placeholder) */}
            <div className="weather-info flex items-center">
              <Sun size={20} className="text-yellow-400 mr-2" />
              <span className="text-white/70 text-sm">26u00b0C</span>
            </div>
          </div>
          
          {/* Opening Hours with expand/collapse functionality */}
          <div className="mt-3">
            <div 
              className="flex items-center cursor-pointer" 
              onClick={() => setIsOpeningHoursExpanded(!isOpeningHoursExpanded)}
            >
              <p className="text-gray-200/70 text-sm">{todayOpeningHours}</p>
              <div className="ml-2">
                {isOpeningHoursExpanded ? (
                  <ChevronUp size={16} className="text-gray-400" />
                ) : (
                  <ChevronDown size={16} className="text-gray-400" />
                )}
              </div>
            </div>
            
            {/* Expanded opening hours */}
            {isOpeningHoursExpanded && cafe.openingHours && cafe.openingHours.length > 0 && (
              <div className="mt-2 pl-1">
                {cafe.openingHours.map((hours, index) => (
                  <p key={index} className="text-gray-200/70 text-sm mb-1">{hours}</p>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Separator Line */}
        <hr className="border-gray-600 my-4" />
        
        {/* Map Container */}
        <div className="map-container-wrapper rounded-lg overflow-hidden relative z-10">
          <a 
            href={getGoogleMapsUrl()} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <img 
              src={getMapImageUrl()}
              alt={`Map of ${cafe.name}`}
              className="map-image w-full block h-[180px] object-cover"
            />
          </a>
        </div>
      </div>
      
      {/* Contact Information Container */}
      {(cafe.phoneNumber || cafe.website) && (
        <div className="contact-info-container mx-6 mt-4 bg-neutral-900 bg-opacity-50 rounded-xl p-4 shadow-md">
          {cafe.phoneNumber && (
            <div className="phone-section flex items-center">
              <Phone size={18} className="text-gray-400 mr-3" />
              <a 
                href={`tel:${cafe.phoneNumber.replace(/\s/g, '')}`} 
                className="text-white/70 text-sm hover:text-white"
              >
                {cafe.phoneNumber}
              </a>
            </div>
          )}
          
          {cafe.phoneNumber && cafe.website && (
            <hr className="border-gray-700 my-3" />
          )}
          
          {cafe.website && (
            <div className="website-section flex items-center">
              <Globe size={18} className="text-gray-400 mr-3" />
              <a 
                href={cafe.website} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-300/70 text-sm hover:text-blue-300 truncate"
              >
                {cafe.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CafeDetail;
