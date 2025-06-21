import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Instagram,
  Home as HomeIcon,
  Menu as MenuIcon,
  Bike,
  Dog,
  Wind,
  Leaf,
  ArrowLeft
} from "lucide-react";
import { type Cafe } from '../types';
import useEmblaCarousel from 'embla-carousel-react';
import type { EmblaOptionsType, EmblaPluginType } from 'embla-carousel';
import Autoplay from 'embla-carousel-autoplay';

interface CafeDetailProps {
  cafe: Cafe;
  onClose: () => void;
  pageBgColor?: string;
  userLocation?: { latitude: number; longitude: number; } | null;
  locationError?: string | null;
}

// Helper functions for distance calculation
function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return Infinity; // Handle missing coords
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

// 为 Embla 插件定义类型
type EmblaPlugin = ReturnType<typeof Autoplay>;

const CafeDetail: React.FC<CafeDetailProps> = ({ cafe, onClose, pageBgColor, userLocation, locationError }) => {
  console.log('Cafe object received in CafeDetail component:', JSON.parse(JSON.stringify(cafe)));
  
  // State for expandable opening hours
  const [isOpeningHoursExpanded, setIsOpeningHoursExpanded] = useState(false);
  
  // Calculate distance from user location to cafe
  const distanceInKm = useMemo(() => {
    if (userLocation && typeof cafe.latitude === 'number' && typeof cafe.longitude === 'number') {
      return getDistanceFromLatLonInKm(
        userLocation.latitude,
        userLocation.longitude,
        cafe.latitude,
        cafe.longitude
      );
    }
    return null;
  }, [userLocation, cafe.latitude, cafe.longitude]);
  
  // 配置自动播放选项
  const autoplayOptions = { delay: 3000, stopOnInteraction: false };
  
  // Embla carousel setup with autoplay
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true }, 
    [Autoplay(autoplayOptions)]
  );
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

  // Format opening hours from "Monday: 6:30 AM – 5:00 PM" to "6:30 AM – 5:00 PM @ Mon"
  const formatOpeningHours = (hoursString: string) => {
    if (!hoursString) return "";
    
    // Day name mapping to abbreviated forms
    const dayAbbreviations: { [key: string]: string } = {
      'monday': 'Mon',
      'tuesday': 'Tue', 
      'wednesday': 'Wed',
      'thursday': 'Thu',
      'friday': 'Fri',
      'saturday': 'Sat',
      'sunday': 'Sun'
    };

    // Match pattern like "Monday: 6:30 AM – 5:00 PM"
    const match = hoursString.match(/^(\w+):\s*(.+)$/);
    if (!match) return hoursString; // Return original if no match
    
    const [, dayName, timeRange] = match;
    const dayKey = dayName.toLowerCase();
    const abbreviatedDay = dayAbbreviations[dayKey] || dayName;
    
    return `${timeRange} @ ${abbreviatedDay}`;
  };

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
    // Prioritize using the googleMapsUri from the cafe data if it exists and looks like a URL
    if (cafe.googleMapsUri && (cafe.googleMapsUri.startsWith('http://') || cafe.googleMapsUri.startsWith('https://'))) {
      return cafe.googleMapsUri;
    }
    
    // Fallback using placeId (more robust than custom googleusercontent links)
    if (cafe.placeId) {
      return `https://www.google.com/maps/search/?api=1&query_place_id=${cafe.placeId}`;
    }
    
    // Fallback using name if placeId is also missing
    if (cafe.name) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cafe.name)}`;
    }

    // Ultimate fallback if nothing is available
    return 'https://www.google.com/maps';
  };



  // Helper function to copy link to clipboard
  async function copyLinkToClipboard(urlToCopy: string) {
    try {
      await navigator.clipboard.writeText(urlToCopy);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy link using navigator.clipboard: ', err);
      // Final fallback if navigator.clipboard.writeText also fails
      alert('Failed to copy link automatically. Please copy manually from address bar.');
    }
  }

  // Handle Share button click
  const handleShareClick = async () => {
    const shareUrl = window.location.href; // URL of the current cafe detail page
    const cafeName = cafe.name || 'Cafe'; // Use actual cafe name if available
    const shareTitle = `Baliciaga: ${cafeName}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          url: shareUrl,
        });
        console.log('Content shared successfully via Web Share API');
      } catch (error) {
        console.error('Error using Web Share API:', error);
        
        // Check if user cancelled the share action
        if (error.name === 'AbortError') {
          console.log('Share cancelled by user.');
          return; // Don't show fallback if user explicitly cancelled
        }
        
        // Only fall back to clipboard copy for actual errors
        await copyLinkToClipboard(shareUrl);
      }
    } else {
      // Fallback if Web Share API is not supported
      console.log('Web Share API not supported, falling back to clipboard copy.');
      await copyLinkToClipboard(shareUrl);
    }
  };

  const hasPhotos = cafe.photos && Array.isArray(cafe.photos) && cafe.photos.length > 0;

  return (
    <div className="bg-transparent w-full rounded-lg relative z-5">
      {/* 新的极简页眉 */}
      <div className="sticky top-0 z-50 py-3 px-4" style={{ height: 'calc(16px + 1.5rem)' }}>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="p-0 h-auto w-auto bg-transparent hover:bg-transparent"
        >
          <ArrowLeft className="h-5 w-5 text-white/90" />
        </Button>
      </div>

      {/* Content Container */}
      <div className="px-4 mb-8">
        {/* Carousel Image Container */}
        <div className="floating-image-container rounded-2xl overflow-hidden bg-gray-700 relative z-30 w-full aspect-square">
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
            </>
          ) : (
            <div className={`${getGradientClass()} w-full h-full flex items-center justify-center text-white`}>{cafe.name} (No Image)</div>
          )}
        </div>
        
        {/* Name and rating in a single row - name on left, rating on right */}
        <div className="name-rating-line mt-4 z-30 relative flex justify-between items-start">
          <h1 className="text-2xl font-bold text-white drop-shadow-sm pr-2 flex-1">{cafe.name}</h1>
          <div className="flex flex-col items-end flex-shrink-0 pt-1">
            <div className="flex items-center">
              <StarOutline size={18} className="text-yellow-500 mr-1" fill="currentColor" />
              <span className="text-white/80 text-base drop-shadow-sm">{cafe.rating?.toFixed(1) || "N/A"}/5</span>
              <span className="text-white/60 text-base ml-1 drop-shadow-sm">({cafe.userRatingsTotal || 0})</span>
            </div>
            {distanceInKm !== null && typeof distanceInKm === 'number' && (
              <div className="flex items-center text-white/80 text-base drop-shadow-sm" style={{ marginTop: '10px' }}>
                <MapPin size={14} className="mr-1 text-gray-300" />
                <span>{distanceInKm.toFixed(1)} km</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Floating Button Row - Responsive Flex Wrap Layout */}
        <div className="floating-button-row my-5 flex flex-wrap gap-3 z-30 relative">
          {/* Order a delivery button - conditional rendering based on gofoodUrl */}
          {cafe.gofoodUrl && (
            <Button
              asChild
              className="bg-white/20 text-white hover:bg-white/30 rounded-full px-3 h-9 text-base font-normal flex items-center justify-center flex-1 basis-[calc(50%-theme(space.1.5))] gap-x-1.5"
            >
              <a href={cafe.gofoodUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-x-1.5">
                <Bike size={16} />
                Order a delivery
              </a>
            </Button>
          )}

          {/* Book a table button - conditional rendering based on table URL */}
          {cafe && cafe.tableUrl && typeof cafe.tableUrl === 'string' && cafe.tableUrl.trim() !== '' && (
            <Button
              asChild
              className="bg-white/20 text-white hover:bg-white/30 rounded-full px-3 h-9 text-base font-normal flex items-center justify-center flex-1 basis-[calc(50%-theme(space.1.5))] gap-x-1.5"
            >
              <a href={cafe.tableUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-x-1.5">
                <BookOpen size={16} />
                Book a table
              </a>
            </Button>
          )}

          {/* Menu button - conditional rendering based on menu URL */}
          {cafe && cafe.menuUrl && typeof cafe.menuUrl === 'string' && cafe.menuUrl.trim() !== '' && (
            <Button
              asChild
              className="bg-white/20 text-white hover:bg-white/30 rounded-full px-3 h-9 text-base font-normal flex items-center justify-center flex-1 basis-[calc(50%-theme(space.1.5))] gap-x-1.5"
            >
              <a href={cafe.menuUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-x-1.5">
                <FileText size={16} />
                Menu
              </a>
            </Button>
          )}
          
          {/* Share button */}
          <Button 
            className="bg-white text-gray-800 hover:bg-gray-100 rounded-full px-3 h-9 text-base font-normal flex items-center justify-center flex-1 basis-[calc(50%-theme(space.1.5))] gap-x-1.5"
            onClick={handleShareClick}
          >
            <Share2 size={16} />
            Share
          </Button>
        </div>
        
        {/* Unified Content Container with semi-transparent overlay */}
        <div className="content-area-container mt-4 bg-black/40 rounded-xl p-4 shadow-md z-30 relative text-white/90">
          {/* Date/Hours/Weather Container */}
          <div className="datetime-weather-container relative z-30 mb-4">
            {/* Opening Hours with expand/collapse functionality and Open/Closed status */}
            <div className="flex items-center mt-3">
              {/* Left Part: Specific Hours + Chevron */}
              <div 
                className="flex items-center cursor-pointer" 
                onClick={() => setIsOpeningHoursExpanded(!isOpeningHoursExpanded)}
              >
                <p className="text-gray-200/90 text-base">
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

              {/* Status Badge - positioned to the right of hours */}
              {typeof cafe.isOpenNow === 'boolean' ? (
                cafe.isOpenNow ? (
                  <div className="bg-green-500 text-white text-sm px-2 py-0.5 rounded-full ml-3">
                    Open
                  </div>
                ) : (
                  <div className="bg-red-500 text-white text-sm px-2 py-0.5 rounded-full ml-3">
                    Closed
                  </div>
                )
              ) : null}
            </div>
            
            {/* Expanded opening hours */}
            {isOpeningHoursExpanded && cafe.openingHours && Array.isArray(cafe.openingHours) && cafe.openingHours.length > 0 && (
              <div className="mt-2 pl-1">
                {cafe.openingHours.map((hours, index) => (
                  <p key={index} className="text-gray-200/90 text-base mb-1">
                    {formatOpeningHours(hours || "")}
                  </p>
                ))}
              </div>
            )}
          </div>
          
          {/* Cafe Attributes Row */}
          {(cafe.allowsDogs || cafe.outdoorSeating || cafe.servesVegetarianFood) && (
            <div className="flex justify-around items-start my-6">
              {cafe.servesVegetarianFood && (
                <div className="flex flex-col items-center text-center">
                  <Leaf size={20} className="text-gray-300 mb-1" />
                  <p className="text-sm text-gray-300">Serves Vegetarian</p>
                </div>
              )}
              {cafe.allowsDogs && (
                <div className="flex flex-col items-center text-center">
                  <Dog size={20} className="text-gray-300 mb-1" />
                  <p className="text-sm text-gray-300">Allows Dogs</p>
                </div>
              )}
              {cafe.outdoorSeating && (
                <div className="flex flex-col items-center text-center">
                  <Wind size={20} className="text-gray-300 mb-1" />
                  <p className="text-sm text-gray-300">Outdoor Seating</p>
                </div>
              )}
            </div>
          )}
          
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
                className="bg-white/20 text-white hover:bg-white/30 rounded-full px-5 h-9 text-base flex items-center justify-center grow basis-0 gap-x-1.5"
                onClick={() => window.location.href = `tel:${cafe.phoneNumber}`}
              >
                <Phone className="h-4 w-4" />
                Tel
              </Button>
            )}
            {cafe.website && (
              <Button
                // variant="outline" // Variant removed
                // size="sm" // Size prop removed
                className="bg-white/20 text-white hover:bg-white/30 rounded-full px-5 h-9 text-base flex items-center justify-center grow basis-0 gap-x-1.5"
                onClick={() => window.open(cafe.website, '_blank')}
              >
                <Globe className="h-4 w-4" />
                Web
              </Button>
            )}
            {cafe.instagram && (
              <Button
                asChild
                className="bg-white/20 text-white hover:bg-white/30 rounded-full px-5 h-9 text-base flex items-center justify-center grow basis-0 gap-x-1.5"
              >
                <a href={cafe.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-x-1.5">
                  <Instagram className="h-4 w-4" />
                  Instagram
                </a>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CafeDetail;