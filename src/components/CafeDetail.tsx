import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Phone, 
  Globe, 
  Star as StarOutline, 
  Sun, 
  MapPin,
  Tag,
  FileText, 
  BookOpen, 
  Share2, 
  ChevronDown, 
  ChevronUp,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Instagram
} from "lucide-react";
import { type Cafe } from '../types';
import useEmblaCarousel from 'embla-carousel-react';

interface CafeDetailProps {
  cafe: Cafe;
  onClose: () => void;
}

const CafeDetail: React.FC<CafeDetailProps> = ({ cafe, onClose }) => {
  console.log('Cafe object received in CafeDetail component:', JSON.parse(JSON.stringify(cafe)));
  
  // State for expandable opening hours
  const [isOpeningHoursExpanded, setIsOpeningHoursExpanded] = useState(false);
  
  // Embla carousel setup without autoplay
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Handle slide changes
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentSlide(emblaApi.selectedScrollSnap());
  }, [emblaApi]);
  
  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    onSelect();
    
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Get price level display
  const getPriceLevelDisplay = (level: number) => {
    if (level < 0 || level > 4) return 'N/A';
    if (level === 0) return 'Free';
    return '$'.repeat(level);
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
    if (!cafe.openingHours || cafe.openingHours.length === 0) return "Hours unavailable";
    const dayEntry = cafe.openingHours.find(h => h && h.toLowerCase().startsWith(currentDay.toLowerCase()));
    if (!dayEntry) return "Hours unavailable";
    const hoursMatch = dayEntry.match(/:\s*(.+)/);
    return hoursMatch && hoursMatch[1] ? hoursMatch[1].trim() : "Hours unavailable";
  }, [cafe.openingHours, currentDay]);

  // NOTE: getMapImageUrl function has been removed as we now use pre-generated staticMapS3Url from the cafe object
  /* 
  // Build Google Maps Static API URL - Commented out as we now use staticMapS3Url
  const getMapImageUrl = () => {
    // Get API key from environment variables
    const MAPS_API_KEY = import.meta.env.VITE_MAPS_API_KEY;
    
    if (!MAPS_API_KEY) {
      console.error("Google Maps API Key is missing!");
      return 'https://via.placeholder.com/600x300.png?text=Map+API+Key+Missing';
    }
    
    return `https://maps.googleapis.com/maps/api/staticmap?center=${cafe.latitude},${cafe.longitude}&zoom=15&size=600x300&maptype=roadmap&markers=color:red%7C${cafe.latitude},${cafe.longitude}&key=${MAPS_API_KEY}`;
  };
  */

  // Get Google Maps URL for cafe using place_id parameter for more accurate location display
  const getGoogleMapsUrl = () => {
    return cafe.placeId ? `https://www.google.com/maps/place/?q=place_id:${cafe.placeId}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${cafe.name} ${cafe.address || ''}`)}`;
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

  const hasPhotos = cafe.photos && Array.isArray(cafe.photos) && cafe.photos.length > 0;

  return (
    <div className="bg-transparent w-full rounded-lg relative z-5 px-4 mb-8">
      {/* Carousel Image Container */}
      <div className="floating-image-container rounded-2xl overflow-hidden bg-gray-700 relative z-30 aspect-[4/3] max-h-72 w-full">
        {hasPhotos ? (
          <>
            <div className="embla overflow-hidden h-full w-full" ref={emblaRef}>
              <div className="embla__container flex h-full">
                {cafe.photos.map((photoUrl, index) => (
                  <div className="embla__slide flex-[0_0_100%] min-w-0 relative" key={index}>
                    <img 
                      src={photoUrl} 
                      alt={`${cafe.name} - Photo ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Pagination indicators - capsule style */}
            {cafe.photos.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-40">
                {cafe.photos.map((_, index) => (
                  <button 
                    key={index}
                    onClick={() => emblaApi && emblaApi.scrollTo(index)}
                    className={`h-1 border-none p-0 rounded-full transition-all ${
                      currentSlide === index 
                        ? 'w-4 bg-white' 
                        : 'w-2 bg-white/40 hover:bg-white/60'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
            
            {/* Add a semi-transparent gradient overlay with pointer-events-none to ensure it doesn't block touch events */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
          </>
        ) : (
          <div className={`${getGradientClass()} w-full h-full flex items-center justify-center text-white`}>{cafe.name} (No Image)</div>
        )}
      </div>
      
      {/* Name and rating in a single row - name on left, rating on right */}
      <div className="name-rating-line mt-4 z-30 relative flex justify-between items-start">
        <h1 className="text-2xl font-bold text-white drop-shadow-sm pr-2">{cafe.name}</h1>
        <div className="flex items-center flex-shrink-0 mt-1">
          <StarOutline size={18} className="text-yellow-500 mr-1" fill="currentColor" />
          <span className="text-white text-sm drop-shadow-sm">{cafe.rating?.toFixed(1) || "N/A"}/5</span>
          <span className="text-white/80 text-sm ml-1 drop-shadow-sm">({cafe.userRatingsTotal || 0})</span>
        </div>
      </div>
      
      {/* Floating Button Row */}
      <div className="floating-button-row my-5 flex items-center space-x-3 z-30 relative">
        {/* Active button - white background with dark text */}
        <button className="bg-white text-gray-800 px-3 py-1.5 rounded-full text-sm font-normal flex items-center justify-center grow basis-0">
          <FileText size={16} className="mr-2" />
          Info
        </button>
        {/* "Menu" button is confirmed removed */}
        <button 
          className="bg-white bg-opacity-20 text-white px-3 py-1.5 rounded-full text-sm font-normal flex items-center justify-center grow basis-0"
          onClick={handleShareClick}
        >
          <Share2 size={16} className="mr-2" />
          Share
        </button>
      </div>
      
      {/* Unified Content Container with semi-transparent overlay */}
      <div className="content-area-container mt-4 bg-black/40 backdrop-blur-sm rounded-xl p-4 shadow-md z-30 relative text-white/90">
        {/* Date/Hours/Weather Container */}
        <div className="datetime-weather-container relative z-30 mb-4">
          <div className="flex justify-between items-center">
            {/* Left side: Date and Status */}
            <div className="flex items-center space-x-3">
              <h3 className="font-medium">{currentDay}</h3>
              
              {/* Open/Closed Status */}
              {typeof cafe.isOpenNow === 'boolean' ? (
                cafe.isOpenNow ? (
                  <div className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center">
                    <CheckCircle2 size={12} className="mr-1" />
                    Open
                  </div>
                ) : (
                  <div className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center">
                    <XCircle size={12} className="mr-1" />
                    Closed
                  </div>
                )
              ) : null}
            </div>
        
            {/* Right side: Weather Info (placeholder) */}
            <div className="weather-info flex items-center">
              <Sun size={18} className="mr-2 text-yellow-400" />
              <span className="text-sm">28°C</span>
            </div>
          </div>
        
          {/* Opening Hours with expand/collapse functionality */}
          <div className="mt-3">
            <div 
              className="flex items-center cursor-pointer" 
              onClick={() => setIsOpeningHoursExpanded(!isOpeningHoursExpanded)}
            >
              <p className="text-gray-200/90 text-sm">
                {todayOpeningHours}
              </p>
              <div className="ml-2">
                {isOpeningHoursExpanded ? (
                  <ChevronUp size={16} className="text-gray-300" />
              ) : (
                  <ChevronDown size={16} className="text-gray-300" />
              )}
              </div>
            </div>
            
            {/* Expanded opening hours */}
            {isOpeningHoursExpanded && cafe.openingHours && Array.isArray(cafe.openingHours) && cafe.openingHours.length > 0 && (
              <div className="mt-2 pl-1">
                {cafe.openingHours.map((hours, index) => (
                  <p key={index} className="text-gray-200/90 text-sm mb-1">
                    {hours || ""}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Separator Line */}
        <hr className="border-gray-600 my-4" />
        
        {/* Map Container (This is the one to KEEP, inside content-area-container) */}
        <div className="mt-6 rounded-lg overflow-hidden">
          <a 
            href={getGoogleMapsUrl()} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            {cafe.staticMapS3Url ? (
              <img 
                src={cafe.staticMapS3Url}
                alt={`Map of ${cafe.name}`}
                className="w-full h-auto object-cover"
              />
            ) : (
              <div className="w-full h-[300px] bg-gray-200 flex items-center justify-center text-gray-600">
                No map image available
              </div>
            )}
          </a>
        </div>
      </div> {/* End of content-area-container */}

      {/* Contact Buttons Row - Applying new flex-grow layout */}
      {(cafe.phoneNumber || cafe.website || cafe.instagram) && (
        <div className="flex items-center space-x-3 mt-4 mb-8">
          {cafe.phoneNumber && (
            <Button
              // variant="outline" // Variant removed
              // size="sm" // Size prop removed
              className="bg-white/20 text-white hover:bg-white/30 rounded-full px-5 h-8 text-sm flex items-center grow basis-0"
              onClick={() => window.location.href = `tel:${cafe.phoneNumber}`}
            >
              <Phone className="mr-1.5 h-4 w-4" />
              Tel
            </Button>
          )}
          {cafe.website && (
            <Button
              // variant="outline" // Variant removed
              // size="sm" // Size prop removed
              className="bg-white/20 text-white hover:bg-white/30 rounded-full px-5 h-8 text-sm flex items-center grow basis-0"
              onClick={() => window.open(cafe.website, '_blank')}
            >
              <Globe className="mr-1.5 h-4 w-4" />
              Web
            </Button>
          )}
          {cafe.instagram && (
            <Button
              // variant="outline" // Variant removed
              // size="sm" // Size prop removed
              className="bg-white/20 text-white hover:bg-white/30 rounded-full px-5 h-8 text-sm flex items-center grow basis-0"
              onClick={() => window.open(cafe.instagram, '_blank')}
            >
              <Instagram className="mr-1.5 h-4 w-4" />
              Instagram
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default CafeDetail;