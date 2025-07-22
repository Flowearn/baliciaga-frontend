import React, { useMemo, useState, useEffect } from 'react';
import { Clock, MapPin } from "lucide-react";
import { type Cafe } from '../types';
import useEmblaCarousel from 'embla-carousel-react';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

// Extend Cafe type to include optional distance
interface CafeWithDistance extends Cafe {
  distanceInKm?: number;
}

type CafeCardProps = {
  cafe?: CafeWithDistance;
};

const CafeCard: React.FC<CafeCardProps> = ({ cafe }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 获取当天营业时间
  const todayOpeningHours = useMemo(() => {
    if (!cafe || !cafe.openingHours || !Array.isArray(cafe.openingHours) || cafe.openingHours.length === 0) {
      return "Hours unavailable";
    }
    
    // 获取当前是星期几
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const currentDay = days[new Date().getDay()];
    
    // 从openingHours数组中查找今天的记录
    const dayEntry = cafe.openingHours.find(hours => 
      hours && typeof hours === 'string' && hours.toLowerCase().startsWith(currentDay.toLowerCase())
    );
    
    if (!dayEntry) {
      return "Hours unavailable";
    }
    
    // 提取营业时间部分
    const hoursMatch = dayEntry.match(/:\s*(.+)/);
    if (hoursMatch && hoursMatch[1]) {
      return hoursMatch[1].trim();
    }
    
    return "Hours unavailable";
  }, [cafe?.openingHours]);

  // Track carousel slide changes
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setCurrentImageIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on('select', onSelect);
    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  // Preload next image
  useEffect(() => {
    // Check if photos exist and there's a next image
    if (cafe?.photos && cafe.photos.length > currentImageIndex + 1) {
      const nextImageUrl = cafe.photos[currentImageIndex + 1];
      
      // Create a new Image object in memory to preload the next image
      const img = new Image();
      img.src = nextImageUrl;
    }
  }, [currentImageIndex, cafe?.photos]);

  if (!cafe || !cafe.placeId || !cafe.name) {
    console.warn("CafeCard received undefined or invalid cafe data");
    return null;
  }

  const hasPhotos = cafe.photos && Array.isArray(cafe.photos) && cafe.photos.length > 0;

  return (
    <div className="w-full mb-2">
      <div className="embla w-full rounded-xl relative overflow-hidden shadow-sm bg-gray-300 aspect-[4/3]">
        <div className="embla__viewport h-full" ref={emblaRef}>
          <div className="embla__container flex h-full">
            {hasPhotos ? (
              cafe.photos.map((photoUrl, index) => (
                <div className="embla__slide flex-[0_0_100%] min-w-0 relative" key={index}>
                  <OptimizedImage
                    src={photoUrl}
                    alt={`${cafe.name} - Photo ${index + 1}`}
                    aspectRatio="4:3"
                    priority={false}
                  />
                </div>
              ))
            ) : (
              <div className="embla__slide flex-[0_0_100%] min-w-0 relative flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500">
                <span className="text-white text-xl">{cafe.name} (No Image)</span>
              </div>
            )}
          </div>
        </div>
        
        {hasPhotos && (
            <div className="absolute inset-0 gradient-overlay-base z-[1] pointer-events-none"></div>
        )}

        <div className="absolute bottom-0 left-0 right-0 pt-4 px-4 pb-3 gradient-overlay-strong z-[2] pointer-events-none">
          <h1 className="text-2xl font-bold text-white drop-shadow-md">{cafe.name}</h1>
        </div>
        
        <div className="absolute top-5 right-5 z-[2]">
          {typeof cafe.isOpenNow === 'boolean' ? (
            cafe.isOpenNow ? (
              <div className="bg-green-500 text-white text-sm px-2 py-0.5 rounded-full flex items-center">
                <span>Open</span>
              </div>
            ) : (
              <div className="bg-red-500 text-white text-sm px-2 py-0.5 rounded-full flex items-center">
                <span>Closed</span>
            </div>
            )
          ) : null}
          </div>
      </div>
      
      <div className="mt-2">
        <div className="flex justify-between items-start">
          {cafe.rating !== undefined && (
            <div className="text-base flex items-center text-gray-500 flex-shrink-0">
              <span className="text-yellow-500 mr-1">⭐</span>
              <span className="font-medium">{typeof cafe.rating === 'number' ? cafe.rating.toFixed(1) : cafe.rating}/5</span>
              <span className="ml-1">({cafe.userRatingsTotal || 0})</span>
            </div>
          )}
          
          <div className="flex flex-col items-end">
            <span className="flex items-center text-gray-500 text-base w-full truncate">
              <Clock size={14} className="mr-1 text-gray-400 flex-shrink-0" />
              <span className="truncate">{todayOpeningHours}</span>
            </span>
            
            {/* Display distance if available */}
            {cafe.distanceInKm !== undefined && (
              <span className="inline-flex items-center text-gray-500 text-base mt-1">
                <MapPin size={14} className="mr-1 text-gray-400" />
                <span>{typeof cafe.distanceInKm === 'number' ? cafe.distanceInKm.toFixed(1) : cafe.distanceInKm} km</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CafeCard;
