import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import CafeCard from '../components/CafeCard';
import CafeCardSkeleton from '../components/CafeCardSkeleton';
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
import { Menu as MenuIcon, Search as SearchIcon, X as XIcon, Coffee, Wine, Home } from "lucide-react";
import FoodNavBar from '../components/FoodNavBar';

// Constant for stale location threshold - moved to module level to avoid ReferenceError
const STALE_LOCATION_THRESHOLD_MS = 15 * 60 * 1000; // 15 minutes

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
  const initialCategoryFromURL = searchParams.get('type') as 'cafe' | 'bar' | 'cowork' | 'food' | null;
  const initialSelectedCategoryValue = initialCategoryFromURL === 'bar' ? 'bar' : 
                                     initialCategoryFromURL === 'cowork' ? 'cowork' : 
                                     initialCategoryFromURL === 'cafe' ? 'cafe' : 'food'; // Default to 'food' instead of 'cafe'
  const [selectedCategory, setSelectedCategory] = useState<'cafe' | 'bar' | 'cowork' | 'food'>(
    initialSelectedCategoryValue
  );
  
  // Get food sub-category directly from URL parameter
  const selectedFoodSubCategory = (searchParams.get('subCategory') as 'all' | 'cafe' | 'dining') || 'all';
  
  // State for preloading control
  const [isHomepageActive, setIsHomepageActive] = useState<boolean>(true);
  
  // State for geolocation - Try to restore from sessionStorage first
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number; } | null>(() => {
    // 尝试从 sessionStorage 快速恢复用户位置
    try {
      const storedLocation = sessionStorage.getItem('userLocation');
      const storedTimestamp = sessionStorage.getItem('lastLocationFetchTimestamp');
      
      if (storedLocation && storedTimestamp) {
        const location = JSON.parse(storedLocation);
        const timestamp = parseInt(storedTimestamp, 10);
        const timeElapsed = Date.now() - timestamp;
        
        // 检查位置是否在15分钟新鲜度阈值内
        if (timeElapsed <= STALE_LOCATION_THRESHOLD_MS) {
          return location;
        }
      }
    } catch (error) {
      console.error('[SCROLL_DEBUG] Failed to restore user location from sessionStorage:', error);
    }
    
    return null;
  });
  const [locationError, setLocationError] = useState<string | null>(null);
  const [lastLocationFetchTimestamp, setLastLocationFetchTimestamp] = useState<number | null>(() => {
    // 同时恢复时间戳
    try {
      const storedTimestamp = sessionStorage.getItem('lastLocationFetchTimestamp');
      return storedTimestamp ? parseInt(storedTimestamp, 10) : null;
    } catch (error) {
      return null;
    }
  });
  
  // State for tracking geolocation failure count for smart error handling
  const [geolocationFailureCount, setGeolocationFailureCount] = useState<number>(0);
  
  const { data: cafes, isLoading, error, refetch, isRefetching } = useQuery<Cafe[], Error>({
    queryKey: ['cafes', selectedCategory],
    queryFn: () => fetchCafes(selectedCategory),
    enabled: !!selectedCategory,
  });
  

  
  // Handle category change - update both state and URL
  const handleCategoryChange = (newCategory: 'cafe' | 'bar' | 'cowork' | 'food') => {
    setSelectedCategory(newCategory); // 1. 更新 React state
    if (newCategory === 'food') {
      // When switching to food, preserve existing subCategory or default to 'all'
      const currentSubCategory = searchParams.get('subCategory') || 'all';
      setSearchParams({ type: newCategory, subCategory: currentSubCategory }, { replace: true });
    } else {
      // For non-food categories, remove subCategory from URL
      setSearchParams({ type: newCategory }, { replace: true });
    }
  };
  
  // Effect to update selectedCategory and selectedFoodSubCategory when URL parameters change
  useEffect(() => {
    const categoryFromUrl = searchParams.get('type') as 'cafe' | 'bar' | 'cowork' | 'food' | null;
    const subCategoryFromUrl = searchParams.get('subCategory') as 'all' | 'cafe' | 'dining' | null;

    // 将URL参数规范化为 'cafe'、'bar'、'cowork' 或 'food'，如果参数不存在或无效，则默认为 'food'
    const newCategoryToSet = categoryFromUrl === 'bar' ? 'bar' : 
                             categoryFromUrl === 'cowork' ? 'cowork' : 
                             categoryFromUrl === 'cafe' ? 'cafe' : 'food'; // Default to 'food'

    // 只有当URL导出的分类与当前React state中的分类不一致时，才更新state
    // 这避免了在按钮点击（已同时更新state和URL）后不必要的state重设
    if (newCategoryToSet !== selectedCategory) {
      setSelectedCategory(newCategoryToSet);
    }
    
    // Food sub-category is now managed directly from URL params, no state needed
  }, [searchParams]); // 只依赖 searchParams，移除 selectedCategory 以避免循环更新

  // Geolocation fetch function
  const fetchUserLocationAndProcessCafes = async () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      // Show user-friendly toast for unsupported browsers
      toast({
        title: "Location services unavailable",
        description: "Your browser doesn't support location services. Listings will be shown in default order.",
        variant: "default"
      });
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
      const locationData = { latitude, longitude };
      const currentTimestamp = Date.now();
      
      setUserLocation(locationData);
      setLastLocationFetchTimestamp(currentTimestamp);
      setLocationError(null);
      // Reset failure count on successful location fetch
      setGeolocationFailureCount(0);
      
      // 保存新位置到 sessionStorage 以供下次快速恢复
      try {
        sessionStorage.setItem('userLocation', JSON.stringify(locationData));
        sessionStorage.setItem('lastLocationFetchTimestamp', currentTimestamp.toString());
      } catch (error) {
        console.error('[SCROLL_DEBUG] Failed to save user location to sessionStorage:', error);
      }
    } catch (error) {
      // Enhanced error handling with specific GeolocationPositionError analysis
      const geoError = error as GeolocationPositionError;
      let errorMessage = "Unable to retrieve location. Displaying default order.";
      let userToastMessage = "";
      let shouldClearStorage = false;
      
      // Increment failure count
      const newFailureCount = geolocationFailureCount + 1;
      setGeolocationFailureCount(newFailureCount);
      
      // Analyze specific geolocation error codes
      if (geoError && typeof geoError.code === 'number') {
        switch (geoError.code) {
          case 1: // PERMISSION_DENIED
            errorMessage = "Location access denied by user.";
            userToastMessage = "Location access was denied. To sort by distance, please enable location permissions in your browser settings.";
            // Don't clear storage immediately - user might grant permission later
            shouldClearStorage = false;
            break;
          case 2: // POSITION_UNAVAILABLE  
            errorMessage = "Position update is unavailable.";
            userToastMessage = "Unable to determine your location. Please check your device's location services and internet connection.";
            // Only clear storage after multiple failures to avoid removing good cached data
            shouldClearStorage = newFailureCount >= 3;
            break;
          case 3: // TIMEOUT
            errorMessage = "Location request timed out.";
            userToastMessage = "Location request timed out. Please try again or check your connection.";
            // Don't clear storage for timeout - it's likely temporary
            shouldClearStorage = false;
            break;
          default:
            errorMessage = "Unknown location error occurred.";
            userToastMessage = "Unable to get your location. Listings will be shown in default order.";
            shouldClearStorage = newFailureCount >= 2;
        }
        
        console.error(`[GEO_ERROR] Code: ${geoError.code}, Message: ${geoError.message}`);
      } else {
        console.error("[GEO_ERROR] Unknown geolocation error:", error);
        shouldClearStorage = newFailureCount >= 2;
      }
      
      setLocationError(errorMessage);
      setUserLocation(null);
      
      // Smart sessionStorage cleanup - only clear after multiple failures or specific error types
      if (shouldClearStorage) {
        try {
          sessionStorage.removeItem('userLocation');
          sessionStorage.removeItem('lastLocationFetchTimestamp');
        } catch (e) {
          // ignore storage errors
        }
      }
      
      // Show user-friendly toast only on multiple failures or critical errors to avoid spam
      if (newFailureCount >= 2 || geoError?.code === 1) {
        toast({
          title: "Location access issue",
          description: userToastMessage,
          variant: "default"
        });
      }
      
      console.error("Geolocation error:", error);
    }
  };

  // Initial geolocation fetch on mount
  useEffect(() => {
    // 如果已经从 sessionStorage 恢复了有效位置，可以延长延迟
    // 如果没有恢复到位置，则正常获取
    const hasRestoredLocation = userLocation !== null;
    const delay = hasRestoredLocation ? 2000 : 100; // 有缓存位置时延迟2秒，无缓存位置时延迟100ms
    
    const timer = setTimeout(() => {
      fetchUserLocationAndProcessCafes();
    }, delay);

    return () => clearTimeout(timer);
  }, []); // 只在组件挂载时运行一次



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
  
  // Filter and sort cafes
  const sortedCafes = useMemo<CafeWithDistance[]>(() => {
    if (!Array.isArray(cafes) || cafes.length === 0) {
      return [];
    }

    // Filter cafes based on food sub-category if in food mode
    let filteredCafes = cafes;
    if (selectedCategory === 'food' && selectedFoodSubCategory !== 'all') {
      console.log('Filtering food items:', { 
        selectedFoodSubCategory, 
        totalItems: cafes.length,
        categories: cafes.map(c => c.category)
      });
      filteredCafes = cafes.filter(cafe => 
        cafe.category === selectedFoodSubCategory
      );
      console.log('Filtered result:', filteredCafes.length);
    }

    // If we have user location, calculate distances and sort by distance
    if (userLocation) {
      const cafesWithDistance = filteredCafes.map(cafe => {
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
      
      const sortedResult = cafesWithDistance.sort((a, b) => {
        // First prioritize open status
        if (a.isOpenNow && !b.isOpenNow) return -1;
        if (!a.isOpenNow && b.isOpenNow) return 1;
        
        // Then sort by distance
        return (a.distanceInKm || Infinity) - (b.distanceInKm || Infinity);
      });

      return sortedResult;
    }
    
    // Default sorting by open status if no location
    const sortedResult = [...filteredCafes].sort((a, b) => {
      if (a.isOpenNow && !b.isOpenNow) return -1;
      if (!a.isOpenNow && b.isOpenNow) return 1;
      return 0;
    });

    return sortedResult;
  }, [cafes, userLocation, selectedCategory, selectedFoodSubCategory]);

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
    // Preserve both type and subCategory parameters
    const params = new URLSearchParams();
    params.set('type', selectedCategory);
    if (selectedCategory === 'food' && selectedFoodSubCategory !== 'all') {
      params.set('subCategory', selectedFoodSubCategory);
    }
    navigate(`/places/${cafe.placeId}?${params.toString()}`, { state: { cafeData: cafe } });
  };

  // Helper function to copy link to clipboard (same as in CafeDetail.tsx)
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

  // Handle Share button click from dropdown menu
  const handleShareClick = async () => {
    const currentCategoryType = searchParams.get('type');
    
    // Build share URL based on current category
    let shareUrl = window.location.origin + '/'; // Default homepage
    if (currentCategoryType === 'bar') {
      shareUrl = window.location.origin + '/?type=bar';
    } else if (currentCategoryType === 'cafe') {
      shareUrl = window.location.origin + '/?type=cafe';
    } else if (currentCategoryType === 'cowork') {
      shareUrl = window.location.origin + '/?type=cowork';
    }
    
    const shareData = {
      title: 'Baliciaga - Bali Cafe & Bar Explorer',
      text: '探索巴厘岛超棒的咖啡馆和酒吧！来看看Baliciaga吧！',
      url: shareUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
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

  // Effect to open search modal if ?search=true is in the URL
  useEffect(() => {
    if (searchParams.get('search') === 'true') {
      setIsSearchModalOpen(true);
      // Remove the search param from URL to avoid re-opening on refresh
      searchParams.delete('search');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  return (
    <div className="pb-4">
      {/* The sticky header and category buttons have been removed from here. */}
      {/* They are now handled globally by GlobalHeader.tsx in App.tsx. */}
      
      {/* Food Sub-category Navigation - 现在作为页面内容的一部分，会随页面滚动 */}
      {selectedCategory === 'food' && (
        <FoodNavBar 
          selectedSubCategory={selectedFoodSubCategory}
          onSubCategoryChange={(subCategory) => {
            // Update URL to preserve sub-category selection
            setSearchParams({ type: 'food', subCategory }, { replace: true });
          }}
        />
      )}
      
      {/* Search Modal */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20"> 
          <div className="bg-white p-6 rounded-lg shadow-xl w-[398px]">
            <div className="flex items-center mb-4">
              <h2 className="flex-1 text-xl font-semibold text-center">
                Search {selectedCategory === 'cafe' ? 'Cafes' : selectedCategory === 'bar' ? 'Bars' : 'Cowork Spaces'}
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
                <p className="text-gray-500">No {selectedCategory === 'cafe' ? 'cafes' : selectedCategory === 'bar' ? 'bars' : 'cowork spaces'} found matching "{searchTerm}".</p>
              )}
              {modalFilteredCafes.map(cafe => (
                <div
                  key={cafe.placeId}
                  className="p-2 hover:bg-gray-100 cursor-pointer rounded"
                  onClick={() => {
                    setIsSearchModalOpen(false); // Close modal on selection
                    // Preserve both type and subCategory parameters
                    const params = new URLSearchParams();
                    params.set('type', selectedCategory);
                    if (selectedCategory === 'food' && selectedFoodSubCategory !== 'all') {
                      params.set('subCategory', selectedFoodSubCategory);
                    }
                    navigate(`/places/${cafe.placeId}?${params.toString()}`); // Navigate to place detail page
                  }}
                >
                  {cafe.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Conditional Rendering for Loading and Content */}
      {isLoading ? (
        <div className="pt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 px-4 sm:px-6 lg:px-8">
            {Array.from({ length: 6 }).map((_, i) => <CafeCardSkeleton key={i} />)}
          </div>
        </div>
      ) : (
        <div className="pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 px-4 sm:px-6 lg:px-8">
            {sortedCafes?.map((cafe) => (
              <div key={cafe.placeId} onClick={() => handleCafeCardClick(cafe)}>
                <CafeCard cafe={cafe} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
