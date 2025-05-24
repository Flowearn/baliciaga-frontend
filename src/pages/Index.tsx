import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
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
import { Menu as MenuIcon, Search as SearchIcon, X as XIcon } from "lucide-react";

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
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for geolocation
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number; } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [lastLocationFetchTimestamp, setLastLocationFetchTimestamp] = useState<number | null>(null);
  
  // Constant for stale location threshold
  const STALE_LOCATION_THRESHOLD_MS = 15 * 60 * 1000; // 15 minutes
  
  const { data: cafes, isLoading, error } = useQuery({
    queryKey: ['cafes'],
    queryFn: fetchCafes,
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
      console.log("Sorting cafes by distance from user location");
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
  }, [cafes, userLocation]);

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
    navigate(`/cafe/${cafe.placeId}`, { state: { cafeData: cafe } });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Sticky Wrapper Div */}
      <div className="sticky top-0 z-50 bg-gray-50 pb-4 px-4">
        {/* HeaderContentDiv */}
        <div className="pt-5 pb-0">
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
            <h1 className="text-3xl font-bold text-black">Baliciaga</h1>

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
        <p className="text-center text-gray-500 mt-1">Flow with the best vibes</p>
      </div>
      </div>
      
      {/* Search Modal */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20"> 
          <div className="bg-white p-6 rounded-lg shadow-xl w-[398px]">
            <div className="flex items-center mb-4">
              <h2 className="flex-1 text-xl font-semibold text-center">Search Cafes</h2>
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
              placeholder="Enter cafe name..."
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            {/* Search Results */}
            <div className="mt-4 max-h-60 overflow-y-auto">
              {searchTerm.trim() && modalFilteredCafes.length === 0 && (
                <p className="text-gray-500">No cafes found matching "{searchTerm}".</p>
              )}
              {modalFilteredCafes.map(cafe => (
                <div
                  key={cafe.placeId}
                  className="p-2 hover:bg-gray-100 cursor-pointer rounded"
                  onClick={() => {
                    setIsSearchModalOpen(false); // Close modal on selection
                    navigate(`/cafe/${cafe.placeId}`); // Navigate to cafe detail page
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
              <p className="text-gray-500">No cafes found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Index;
