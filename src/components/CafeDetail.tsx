import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
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
import VenueAttributes from '@/features/rentals/components/VenueAttributes';
import VenueDescription from './VenueDescription';

interface CafeDetailProps {
  cafe: Cafe;
  onClose: () => void;
  pageBgColor?: string;
  userLocation?: { latitude: number; longitude: number; } | null;
  locationError?: string | null;
  sections?: Array<{ title: string; body: string }>;
}

// Helper functions for distance calculation
function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return Infinity;
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

type EmblaPlugin = ReturnType<typeof Autoplay>;

const CafeDetail: React.FC<CafeDetailProps> = ({ cafe, onClose, pageBgColor, userLocation, locationError, sections }) => {
  const { t } = useTranslation('common');
  const { toast } = useToast();
  
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
  
  const autoplayOptions = { delay: 3000, stopOnInteraction: false };
  
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true }, 
    [Autoplay(autoplayOptions)]
  );
  const [currentSlide, setCurrentSlide] = useState(0);
  
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

  const getPriceLevelDisplay = (level: number) => {
    if (level < 0 || level > 4) return t('details.not_available');
    if (level === 0) return 'Free';
    return '$'.repeat(level);
  };

  const getGradientClass = () => {
    const gradients = [
      'bg-gradient-to-r from-blue-500 to-purple-500',
      'bg-gradient-to-r from-green-500 to-teal-500',
      'bg-gradient-to-r from-yellow-500 to-orange-500',
      'bg-gradient-to-r from-pink-500 to-red-500'
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  };

  const currentDay = useMemo(() => {
    // 基准英文星期名 (用于匹配数据)
    const baseDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return baseDays[new Date().getDay()];
  }, []);

  const todayOpeningHours = useMemo(() => {
    if (!cafe.openingHours || cafe.openingHours.length === 0) return t('details.operating_hours_unavailable');
    const dayEntry = cafe.openingHours.find(h => h && h.toLowerCase().startsWith(currentDay.toLowerCase()));
    if (!dayEntry) return t('details.operating_hours_unavailable');
    const hoursMatch = dayEntry.match(/:\s*(.+)/);
    return hoursMatch && hoursMatch[1] ? hoursMatch[1].trim() : t('details.operating_hours_unavailable');
  }, [cafe.openingHours, currentDay, t]);

  const formatOpeningHours = (hoursString: string) => {
    if (!hoursString) return "";
    
    // 基准英文星期名
    const baseDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const daysShort = t('details.days_short', { returnObjects: true }) as string[];
    
    const match = hoursString.match(/^(\w+):\s*(.+)$/);
    if (!match) return hoursString;
    
    const [, dayName, timeRange] = match;
    const dayIndex = baseDays.findIndex(d => d.toLowerCase() === dayName.toLowerCase());
    const abbreviatedDay = dayIndex >= 0 ? daysShort[dayIndex] : dayName;
    
    return `${timeRange} @ ${abbreviatedDay}`;
  };

  const getGoogleMapsUrl = () => {
    if (cafe.googleMapsUri && (cafe.googleMapsUri.startsWith('http://') || cafe.googleMapsUri.startsWith('https://'))) {
      return cafe.googleMapsUri;
    }
    
    if (cafe.placeId) {
      return `https://www.google.com/maps/search/?api=1&query_place_id=${cafe.placeId}`;
    }
    
    if (cafe.name) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cafe.name)}`;
    }

    return 'https://www.google.com/maps';
  };

  async function copyLinkToClipboard(urlToCopy: string) {
    try {
      await navigator.clipboard.writeText(urlToCopy);
      toast({
        title: t('toast.link_copied_title'),
        description: t('toast.link_copied_desc'),
      });
    } catch (err) {
      console.error('Failed to copy link using navigator.clipboard: ', err);
      toast({
        title: 'Error',
        description: t('toast.share_fail'),
        variant: 'destructive',
      });
    }
  }

  const handleShareClick = async () => {
    const shareUrl = window.location.href;
    const cafeName = cafe.name || 'Cafe';
    const shareTitle = `Baliciaga: ${cafeName}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          url: shareUrl,
        });
        console.log('Content shared successfully via Web Share API');
      } catch (error: any) {
        console.error('Error using Web Share API:', error);
        
        if (error.name === 'AbortError') {
          console.log('Share cancelled by user.');
          return;
        }
        
        await copyLinkToClipboard(shareUrl);
      }
    } else {
      console.log('Web Share API not supported, falling back to clipboard copy.');
      await copyLinkToClipboard(shareUrl);
    }
  };

  const hasPhotos = cafe.photos && Array.isArray(cafe.photos) && cafe.photos.length > 0;

  return (
    <div className="bg-transparent w-full rounded-lg relative z-5">
      <div className="sticky top-0 z-50" style={{ height: 'calc(16px + 1.5rem)' }}>
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 py-3 px-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="p-0 h-auto w-auto bg-transparent hover:bg-transparent"
          >
            <ArrowLeft className="h-5 w-5 text-white/90" />
          </Button>
        </div>
      </div>

      <div className="px-4 mb-8" style={{ marginTop: '16px' }}>
        <div className="floating-image-container rounded-2xl overflow-hidden bg-gray-700 relative z-30 w-full aspect-square">
          {hasPhotos ? (
            <>
              <div className="embla overflow-hidden h-full w-full" ref={emblaRef}>
                <div className="embla__container flex h-full">
                  {cafe.photos.map((photoUrl, index) => (
                    <div className="embla__slide flex-[0_0_100%] min-w-0 relative" key={index}>
                      <OptimizedImage 
                        src={photoUrl} 
                        alt={`${cafe.name} - Photo ${index + 1}`} 
                        aspectRatio="1:1"
                        priority={index === 0}
                      />
                    </div>
                  ))}
                </div>
              </div>
              
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
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
            </>
          ) : (
            <div className={`${getGradientClass()} w-full h-full flex items-center justify-center text-white`}>{cafe.name} {t('details.no_image')}</div>
          )}
        </div>
        
        <div className="name-rating-line mt-4 z-30 relative flex justify-between items-start">
          <h1 className="text-2xl font-bold text-white drop-shadow-sm pr-2 flex-1">{cafe.name}</h1>
          <div className="flex flex-col items-end flex-shrink-0 pt-1">
            <div className="flex items-center">
              <StarOutline size={18} className="text-yellow-500 mr-1" fill="currentColor" />
              <span className="text-white/80 text-base drop-shadow-sm">{typeof cafe.rating === 'number' ? cafe.rating.toFixed(1) : cafe.rating || t('details.not_available')}/5</span>
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

        {sections && sections.length > 0 && (
          <div className="mt-4 bg-black/40 rounded-xl px-4 pt-4 pb-1 shadow-md z-30 relative">
            <VenueDescription sections={sections} />
          </div>
        )}

        <VenueAttributes 
          venue={{
            // Cafe/Dining fields
            cuisineStyle: cafe.cuisineStyle,
            atmosphere: cafe.atmosphere,
            signatureDishes: cafe.signatureDishes,
            // Bar specific fields
            drinkFocus: cafe.drinkFocus,
            barType: cafe.barType,
            signatureDrinks: cafe.signatureDrinks,
            priceRange: cafe.priceRange
          }}
        />
        
        <div className="floating-button-row my-5 flex flex-wrap gap-3 z-30 relative">
          {cafe.gofoodUrl && (
            <Button
              asChild
              className="bg-white/20 text-white hover:bg-white/30 rounded-full px-3 h-9 text-base flex items-center justify-center flex-1 basis-[calc(50%-theme(space.1.5))] gap-x-1.5"
            >
              <a href={cafe.gofoodUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-x-1.5">
                <Bike size={16} />
                {t('details.order_button')}
              </a>
            </Button>
          )}

          {cafe && cafe.tableUrl && typeof cafe.tableUrl === 'string' && cafe.tableUrl.trim() !== '' && (
            <Button
              asChild
              className="bg-white/20 text-white hover:bg-white/30 rounded-full px-3 h-9 text-base flex items-center justify-center flex-1 basis-[calc(50%-theme(space.1.5))] gap-x-1.5"
            >
              <a href={cafe.tableUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-x-1.5">
                <BookOpen size={16} />
                {t('details.reserve_button')}
              </a>
            </Button>
          )}

          {cafe && cafe.menuUrl && typeof cafe.menuUrl === 'string' && cafe.menuUrl.trim() !== '' && (
            <Button
              asChild
              className="bg-white/20 text-white hover:bg-white/30 rounded-full px-3 h-9 text-base flex items-center justify-center flex-1 basis-[calc(50%-theme(space.1.5))] gap-x-1.5"
            >
              <a href={cafe.menuUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-x-1.5">
                <FileText size={16} />
                {t('details.menu_button')}
              </a>
            </Button>
          )}
          
          <Button 
            className="bg-white text-gray-800 hover:bg-gray-100 rounded-full px-3 h-9 text-base flex items-center justify-center flex-1 basis-[calc(50%-theme(space.1.5))] gap-x-1.5"
            onClick={handleShareClick}
          >
            <Share2 size={16} />
            {t('details.share_button')}
          </Button>
        </div>
        
        <div className="content-area-container mt-4 bg-black/40 rounded-xl p-4 shadow-md z-30 relative text-white/90">
          <div className="datetime-weather-container relative z-30 mb-4">
            <div className="flex items-center justify-between">
              <div 
                className="flex items-center cursor-pointer flex-1 max-w-[50%]" 
                onClick={() => setIsOpeningHoursExpanded(!isOpeningHoursExpanded)}
              >
                <p className="text-gray-200/90 text-base break-words">
                  {todayOpeningHours}
                </p>
                <div className="ml-2 flex-shrink-0">
                  {isOpeningHoursExpanded ? (
                    <ChevronUp size={16} className="text-gray-300" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-300" />
                  )}
                </div>
              </div>

              {typeof cafe.isOpenNow === 'boolean' ? (
                cafe.isOpenNow ? (
                  <div className="bg-green-500 text-white text-sm px-2 py-0.5 rounded-full ml-3 flex-shrink-0">
                    {t('details.status_open')}
                  </div>
                ) : (
                  <div className="bg-red-500 text-white text-sm px-2 py-0.5 rounded-full ml-3 flex-shrink-0">
                    {t('details.status_closed')}
                  </div>
                )
              ) : null}
            </div>
            
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
          
          {(cafe.allowsDogs || cafe.outdoorSeating || cafe.servesVegetarianFood) && (
            <div className="flex justify-around items-start my-6">
              {cafe.servesVegetarianFood && (
                <div className="flex flex-col items-center text-center">
                  <Leaf size={20} className="text-gray-300 mb-1" />
                  <p className="text-sm text-gray-300">{t('details.amenities.serves_vegetarian')}</p>
                </div>
              )}
              {cafe.allowsDogs && (
                <div className="flex flex-col items-center text-center">
                  <Dog size={20} className="text-gray-300 mb-1" />
                  <p className="text-sm text-gray-300">{t('details.amenities.allows_dogs')}</p>
                </div>
              )}
              {cafe.outdoorSeating && (
                <div className="flex flex-col items-center text-center">
                  <Wind size={20} className="text-gray-300 mb-1" />
                  <p className="text-sm text-gray-300">{t('details.amenities.outdoor_seating')}</p>
                </div>
              )}
            </div>
          )}
          
          <div className="mt-6 rounded-lg overflow-hidden">
            <a 
              href={getGoogleMapsUrl()} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              {cafe.staticMapS3Url ? (
                <OptimizedImage 
                  src={cafe.staticMapS3Url}
                  alt={`Map of ${cafe.name}`}
                  aspectRatio="16:9"
                  priority={false}
                />
              ) : (
                <div className="w-full h-[300px] bg-gray-200 flex items-center justify-center text-gray-600">
                  {t('details.map_unavailable')}
                </div>
              )}
            </a>
          </div>
        </div>

        {(cafe.phoneNumber || cafe.website || cafe.instagram) && (
          <div className="flex items-center space-x-3 mt-4 mb-8">
            {cafe.phoneNumber && (
              <Button
                className="bg-white/20 text-white hover:bg-white/30 rounded-full px-5 h-9 text-base flex items-center justify-center grow basis-0 gap-x-1.5"
                onClick={() => window.location.href = `tel:${cafe.phoneNumber}`}
              >
                <Phone className="h-4 w-4" />
                {t('details.call_button')}
              </Button>
            )}
            {cafe.website && (
              <Button
                className="bg-white/20 text-white hover:bg-white/30 rounded-full px-5 h-9 text-base flex items-center justify-center grow basis-0 gap-x-1.5"
                onClick={() => window.open(cafe.website, '_blank')}
              >
                <Globe className="h-4 w-4" />
                {t('details.website_button')}
              </Button>
            )}
            {cafe.instagram && (
              <Button
                asChild
                className="bg-white/20 text-white hover:bg-white/30 rounded-full px-5 h-9 text-base flex items-center justify-center grow basis-0 gap-x-1.5"
              >
                <a href={cafe.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-x-1.5">
                  <Instagram className="h-4 w-4" />
                  {t('details.instagram_button')}
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