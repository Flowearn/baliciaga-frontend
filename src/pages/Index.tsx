import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import CafeCard from '../components/CafeCard';
import { fetchCafes } from '../services/cafeService';
import { type Cafe } from '../types';
import { toast } from "@/hooks/use-toast";
import { addCafeToCache } from '../lib/queryUtils';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu as MenuIcon, Search as SearchIcon, X as XIcon, Coffee, Wine } from "lucide-react";

// Haversine formula to calculate distance between two points on Earth
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Define a type for cafe with distance
interface CafeWithDistance extends Cafe {
  distanceInKm?: number;
}

const Index = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for category selection - initialize from URL parameter
  const initialCategoryFromURL = searchParams.get('type') as 'cafe' | 'bar' | null;
  const initialSelectedCategoryValue = initialCategoryFromURL === 'bar' ? 'bar' : 'cafe';
  console.log('[Index.tsx] useState init: initialCategoryFromURL:', initialCategoryFromURL);
  console.log('[Index.tsx] useState init: initialSelectedCategoryValue set to:', initialSelectedCategoryValue);
  const [selectedCategory, setSelectedCategory] = useState<'cafe' | 'bar'>(
    initialSelectedCategoryValue
  );
  
  // State for preloading control
  const [isHomepageActive, setIsHomepageActive] = useState<boolean>(true);
  const preloadedUrls = useRef(new Set<string>());
  
  // State for geolocation
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number; } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [lastLocationFetchTimestamp, setLastLocationFetchTimestamp] = useState<number | null>(null);
  
  // Constant for stale location threshold
  const STALE_LOCATION_THRESHOLD_MS = 15 * 60 * 1000; // 15 minutes
  
  const { data: cafes, isLoading, error } = useQuery({
    queryKey: ['cafes', selectedCategory],
    queryFn: () => fetchCafes(selectedCategory),
    placeholderData: [
      {
        placeId: '1',
        name: 'Two Face Coffee',
        address: 'Jl. Pantai Berawa No.20, Canggu, Bali',
        latitude: -8.650337,
        longitude: 115.159063,
        photos: ['https://via.placeholder.com/400x300?text=Two+Face+Coffee'],
        openingHours: [
          'Monday: 7:30 AM – 4:00 PM',
          'Tuesday: 7:30 AM – 4:00 PM',
          'Wednesday: 7:30 AM – 4:00 PM',
          'Thursday: 7:30 AM – 4:00 PM',
          'Friday: 7:30 AM – 4:00 PM',
          'Saturday: 7:30 AM – 4:00 PM',
          'Sunday: 7:30 AM – 4:00 PM'
        ],
        isOpenNow: true,
        rating: 4.5,
        userRatingsTotal: 512,
        website: 'https://twofacecoffee.com',
        phoneNumber: '+62 123 456789',
        priceLevel: 2,
        types: ['cafe', 'restaurant', 'food', 'point_of_interest', 'establishment'],
        region: 'canggu',
        businessStatus: 'OPERATIONAL',
      },
      {
        placeId: '2',
        name: 'Satu Jalan Coffee',
        address: 'Jl. Batu Bolong No.64, Canggu, Bali',
        latitude: -8.651857,
        longitude: 115.131256,
        photos: ['https://via.placeholder.com/400x300?text=Satu+Jalan+Coffee'],
        openingHours: [
          'Monday: 7:00 AM – 6:00 PM',
          'Tuesday: 7:00 AM – 6:00 PM',
          'Wednesday: 7:00 AM – 6:00 PM',
          'Thursday: 7:00 AM – 6:00 PM',
          'Friday: 7:00 AM – 6:00 PM',
          'Saturday: 7:00 AM – 6:00 PM',
          'Sunday: 7:00 AM – 6:00 PM'
        ],
        isOpenNow: true,
        rating: 4.7,
        userRatingsTotal: 328,
        website: 'https://satujalan.coffee',
        phoneNumber: '+62 987 654321',
        priceLevel: 2,
        types: ['cafe', 'restaurant', 'food', 'point_of_interest', 'establishment'],
        region: 'canggu',
        businessStatus: 'OPERATIONAL',
      }
    ]
  });
  
  // Handle category change - update both state and URL
  const handleCategoryChange = (newCategory: 'cafe' | 'bar') => {
    console.log('[Index.tsx] handleCategoryChange: Clicked category:', newCategory);
    console.log('[Index.tsx] handleCategoryChange: current selectedCategory BEFORE update:', selectedCategory);
    setSelectedCategory(newCategory); // 1. 更新 React state
    setSearchParams({ type: newCategory }, { replace: true }); // 2. 更新 URL search param (使用 replace 避免不必要的历史记录)
    console.log('[Index.tsx] handleCategoryChange: selectedCategory AFTER update (expected):', newCategory);
    console.log('[Index.tsx] handleCategoryChange: searchParams AFTER update (expected):', `type=${newCategory}`);
  };
  
  // Effect to update selectedCategory when URL parameter changes (for external URL changes like browser back/forward)
  useEffect(() => {
    const categoryFromUrl = searchParams.get('type') as 'cafe' | 'bar' | null;
    console.log('[Index.tsx] useEffect[searchParams]: categoryFromUrl from searchParams:', categoryFromUrl);

    // 将URL参数规范化为 'cafe' 或 'bar'，如果参数不存在或无效，则默认为 'cafe'
    const newCategoryToSet = (categoryFromUrl === 'bar') ? 'bar' : 'cafe';
    console.log('[Index.tsx] useEffect[searchParams]: newCategoryToSet based on URL:', newCategoryToSet);
    console.log('[Index.tsx] useEffect[searchParams]: current selectedCategory state BEFORE potential update:', selectedCategory);

    // 只有当URL导出的分类与当前React state中的分类不一致时，才更新state
    // 这避免了在按钮点击（已同时更新state和URL）后不必要的state重设
    if (newCategoryToSet !== selectedCategory) {
      console.log('[Index.tsx] useEffect[searchParams]: Updating selectedCategory to:', newCategoryToSet);
      setSelectedCategory(newCategoryToSet);
    } else {
      console.log('[Index.tsx] useEffect[searchParams]: No update to selectedCategory needed, already in sync.');
    }
  }, [searchParams, selectedCategory]); // 主要依赖 searchParams，避免循环更新

  // Geolocation fetch function
  const fetchUserLocationAndProcessCafes = async () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => resolve(position),
          (error) => reject(error),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      });

      const { latitude, longitude } = position.coords;
      setUserLocation({ latitude, longitude });
      setLastLocationFetchTimestamp(Date.now());
      setLocationError(null);
      console.log("User location fetched:", latitude, longitude);
    } catch (error) {
      setLocationError("Unable to retrieve location. Displaying default order.");
      setUserLocation(null);
      console.error("Geolocation error:", error);
    }
  };

  // Initial geolocation fetch on mount
  useEffect(() => {
    fetchUserLocationAndProcessCafes();
  }, []);

  // DIAGNOSTIC: Track component mounting/unmounting (for debugging scroll issue)
  useEffect(() => {
    console.log('[DIAGNOSTIC] Index.tsx: Component Did MOUNT. Timestamp:', Date.now());
    return () => {
      console.log('[DIAGNOSTIC] Index.tsx: Component Will UNMOUNT. Timestamp:', Date.now());
    };
  }, []); // Empty dependency array means this runs only on mount and unmount

  // Effect to manage isHomepageActive based on location
  useEffect(() => {
    setIsHomepageActive(location.pathname === '/');
  }, [location.pathname]);

  // Re-fetch geolocation on tab visibility change if stale
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && lastLocationFetchTimestamp) {
        const timeElapsed = Date.now() - lastLocationFetchTimestamp;
        if (timeElapsed > STALE_LOCATION_THRESHOLD_MS) {
          console.log("Location data is stale, re-fetching...");
          fetchUserLocationAndProcessCafes();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [lastLocationFetchTimestamp, STALE_LOCATION_THRESHOLD_MS]);
  
  // Cache cafes
  useEffect(() => {
    if (Array.isArray(cafes) && cafes.length > 0) {
      cafes.forEach(cafe => {
        if (cafe && cafe.placeId) {
          addCafeToCache(queryClient, cafe);
        }
      });
    }
  }, [cafes, queryClient]);
  
  // Display error toast
  React.useEffect(() => {
    if (error) {
      toast({
        title: "Failed to load data",
        description: "Unable to fetch cafe data from server. Please try again later.",
        variant: "destructive"
      });
      console.error("Error loading data:", error);
    }
  }, [error]);
  
  // Sort cafes by distance if user location is available, otherwise sort by open status
  const sortedCafes = useMemo<CafeWithDistance[]>(() => {
    if (!Array.isArray(cafes) || cafes.length === 0) {
      return [];
    }

    // If we have user location, calculate distances and sort by distance
    if (userLocation) {
      console.log(`Sorting ${selectedCategory}s by distance from user location`);
      const cafesWithDistance = cafes.map(cafe => {
        const distanceInKm = getDistanceFromLatLonInKm(
          userLocation.latitude,
          userLocation.longitude,
          cafe.latitude,
          cafe.longitude
        );
        
        return {
          ...cafe,
          distanceInKm
        };
      });
      
      return cafesWithDistance.sort((a, b) => {
        // First prioritize open status
        if (a.isOpenNow && !b.isOpenNow) return -1;
        if (!a.isOpenNow && b.isOpenNow) return 1;
        
        // Then sort by distance
        return (a.distanceInKm || Infinity) - (b.distanceInKm || Infinity);
      });
    }
    
    // Default sorting by open status if no location
    return [...cafes].sort((a, b) => {
      if (a.isOpenNow && !b.isOpenNow) return -1;
      if (!a.isOpenNow && b.isOpenNow) return 1;
      return 0;
    });
  }, [cafes, userLocation, selectedCategory]);

  // Main preloading logic for homepage images
  useEffect(() => {
    // Return early if not on homepage or no cafes available
    if (!isHomepageActive || !sortedCafes || sortedCafes.length === 0) {
      return;
    }

    const preloadImage = (url: string) => {
      if (!preloadedUrls.current.has(url)) {
        const img = new Image();
        img.src = url;
        preloadedUrls.current.add(url);
        // console.log(`Preloading initiated for: ${url}`); // Optional debug log
      }
    };

    // Round 1: Preload first images of all cafes
    sortedCafes.forEach(cafe => {
      if (cafe.photos && cafe.photos.length > 0 && cafe.photos[0]) {
        preloadImage(cafe.photos[0]);
      }
    });

    // Round 2: Preload second images of all cafes
    sortedCafes.forEach(cafe => {
      if (cafe.photos && cafe.photos.length > 1 && cafe.photos[1]) {
        preloadImage(cafe.photos[1]);
      }
    });
  }, [sortedCafes, isHomepageActive]);

  // Filter cafes for search modal based on searchTerm
  const modalFilteredCafes = useMemo(() => {
    if (!searchTerm.trim()) {
      return []; // Return empty array if search term is empty
    }
    return (Array.isArray(cafes) && cafes.length > 0)
      ? cafes.filter(cafe =>
          cafe && cafe.name && typeof cafe.name === 'string' &&
          cafe.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : [];
  }, [cafes, searchTerm]);

  const handleCafeCardClick = (cafe: Cafe) => {
    addCafeToCache(queryClient, cafe);
    navigate(`/places/${cafe.placeId}?type=${selectedCategory}`, { state: { cafeData: cafe } });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Sticky Wrapper Div */}
      <div className="sticky top-0 z-50 bg-gray-50 py-3 px-4">
        {/* HeaderContentDiv */}
        <div className="pt-0 pb-0">
          {/* Title Row */}
          <div className="flex items-center justify-between w-full">
            {/* Search Icon (Left) */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-black hover:bg-gray-200"
              onClick={() => setIsSearchModalOpen(true)}
            >
              <SearchIcon className="h-6 w-6" />
            </Button>

            {/* Title (Center) */}
            <h1 
              className="text-3xl font-bold text-black cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Baliciaga
            </h1>

            {/* Menu Icon (Right) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-black hover:bg-gray-200">
                  <MenuIcon className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem 
                  className="flex justify-center" 
                  onSelect={() => { window.location.href = 'mailto:yo@baliciaga.com'; }}
                >
                  Contact
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      
      {/* Category Switching Buttons */}
      <div className="py-4 px-4">
        <div className="flex gap-3">
          {/* Cafe Button */}
          <button
            onClick={() => handleCategoryChange('cafe')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-full text-sm transition-colors ${
              selectedCategory === 'cafe'
                ? 'bg-white text-[rgb(41,55,31)] border border-black'
                : 'bg-white text-gray-500 border border-gray-400'
            }`}
            style={{ height: '32px' }}
          >
            <Coffee className="w-4 h-4" />
            <span>Cafe</span>
          </button>
          
          {/* Bar Button */}
          <button
            onClick={() => handleCategoryChange('bar')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-full text-sm transition-colors ${
              selectedCategory === 'bar'
                ? 'bg-white text-[rgb(41,55,31)] border border-black'
                : 'bg-white text-gray-500 border border-gray-400'
            }`}
            style={{ height: '32px' }}
          >
            <Wine className="w-4 h-4" />
            <span>Bar</span>
          </button>
        </div>
      </div>
      
      {/* Search Modal */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20"> 
          <div className="bg-white p-6 rounded-lg shadow-xl w-[398px]">
            <div className="flex items-center mb-4">
              <h2 className="flex-1 text-xl font-semibold text-center">
                Search {selectedCategory === 'cafe' ? 'Cafes' : 'Bars'}
              </h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsSearchModalOpen(false)}
              >
                <XIcon className="h-6 w-6" />
              </Button>
            </div>
            <input
              type="text"
              placeholder={`Enter ${selectedCategory} name...`}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            {/* Search Results */}
            <div className="mt-4 max-h-60 overflow-y-auto">
              {searchTerm.trim() && modalFilteredCafes.length === 0 && (
                <p className="text-gray-500">No {selectedCategory === 'cafe' ? 'cafes' : 'bars'} found matching "{searchTerm}".</p>
              )}
              {modalFilteredCafes.map(cafe => (
                <div
                  key={cafe.placeId}
                  className="p-2 hover:bg-gray-100 cursor-pointer rounded"
                  onClick={() => {
                    setIsSearchModalOpen(false); // Close modal on selection
                    navigate(`/places/${cafe.placeId}?type=${selectedCategory}`); // Navigate to place detail page
                  }}
                >
                  {cafe.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {isLoading && (
        <div className="flex justify-center items-center py-20 px-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {!isLoading && (
        <div className="space-y-2 px-4">
          {sortedCafes.map(cafe => (
            <div key={cafe.placeId} onClick={() => handleCafeCardClick(cafe)}>
              <CafeCard cafe={cafe} />
            </div>
          ))}
          
          {sortedCafes.length === 0 && !isLoading && (
            <div className="text-center py-10">
              <p className="text-gray-500">No {selectedCategory === 'cafe' ? 'cafes' : 'bars'} found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Index;
