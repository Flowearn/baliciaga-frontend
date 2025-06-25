import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchPlaceDetails } from '../services/cafeService';
import { type Cafe } from '../types';
import CafeDetail from '@/components/CafeDetail';
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const CafeDetailPage: React.FC = () => {
  const { placeId } = useParams<{ placeId: string }>();
  const [searchParams] = useSearchParams();
  const categoryType = searchParams.get('type') as 'cafe' | 'bar' | 'cowork' || 'cafe';
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  
  // State for random background color
  const [bgColor, setBgColor] = useState<string>('');
  
  // State for user location and location error
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number; } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  // Pantone background colors
  useEffect(() => {
    const pantoneBackgroundColors = [
      '#F0F1E3', // PANTONE 11-4302 Cannoli Cream
      '#DFC9B8', // PANTONE 13-1108 Cream Tan
      '#B7AC93', // PANTONE 15-1116 Safari
      '#BDA08A', // PANTONE 15-1317 Sirocco
      '#9E7B66', // PANTONE 17-1230 Mocha Mousse
      '#9E8977', // PANTONE 16-1414 Chanterelle
      '#86675B', // PANTONE 18-1421 Baltic Amber
      '#534540'  // PANTONE 19-1216 Chocolate Martini
    ];
    const randomIndex = Math.floor(Math.random() * pantoneBackgroundColors.length);
    setBgColor(pantoneBackgroundColors[randomIndex]);
  }, []); // Empty dependency array ensures this runs only once on mount
  
  // Fetch user's geolocation on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationError(null); // Clear any previous error
          console.log("User location fetched/retrieved for CafeDetailPage:", position.coords);
        },
        (error) => {
          setLocationError("Unable to retrieve your location to calculate distance.");
          setUserLocation(null); // Clear any previous location
          console.error("Geolocation error in CafeDetailPage:", error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000, // 10 seconds
          maximumAge: 300000 // 5 minutes (5 * 60 * 1000 ms)
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
    }
  }, []); // Empty dependency array ensures this runs once on mount
  
  // Extract the cafe data from location state if available
  const initialCafeData = location.state?.cafeData as Cafe | undefined;

  // Try to get existing data from cache if available
  const existingData = queryClient.getQueryData<Cafe>(['placeDetails', placeId, categoryType]);

  // Fetch place details using React Query with initialData
  const { data: cafe, isLoading, error } = useQuery({
    queryKey: ['placeDetails', placeId, categoryType],
    queryFn: () => placeId ? fetchPlaceDetails(placeId, categoryType) : Promise.reject('No placeId provided'),
    enabled: !!placeId,
    // Use either the data passed via navigation state or existing cache data
    initialData: initialCafeData || existingData,
    // Use a longer staleTime to reduce unnecessary refetching
    staleTime: 5 * 60 * 1000, // 5 minutes
    // If we have initialData, disable the loading indicator
    ...(initialCafeData && { placeholderData: initialCafeData })
  });

  // Prefetch related places when initial data is loaded
  useEffect(() => {
    if (cafe && cafe.types && cafe.types.length > 0) {
      // We could potentially prefetch other related places here
      // For example, we could fetch places with similar types or nearby location
      // This is just a placeholder for potential future optimizations
    }
  }, [cafe, queryClient]);

  // Show error message when request fails
  useEffect(() => {
    if (error) {
      toast({
        title: "Failed to load place details",
        description: "Unable to fetch place details. Please try again later.",
        variant: "destructive"
      });
      console.error("Error loading place details:", error);
    }
  }, [error]);

  const handleGoBack = () => {
    // Use browser's back navigation to preserve scroll position
    navigate(-1);
  };

  // Only show loading if we don't have any data yet
  if (isLoading && !cafe) {
    return (
      <div className="min-h-screen w-full flex justify-center items-center" style={{ backgroundColor: bgColor || '#534540' }}>
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
      </div>
    );
  }

  // Error state
  if (error || !cafe) {
    return (
      <div className="min-h-screen w-full flex flex-col justify-center items-center p-6 text-white" style={{ backgroundColor: bgColor || '#534540' }}>
        <h2 className="text-2xl font-bold mb-4">Place not found</h2>
        <p className="mb-6 text-center">The place you're looking for could not be found or there was an error loading it.</p>
        <Button onClick={handleGoBack} variant="outline" className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  // Display place detail (back button removed)
  return (
    <>
      {/* Background layer that starts from the very top */}
      <div 
        className="fixed inset-0 z-0"
        style={{ backgroundColor: bgColor }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>
      
      {/* Content layer */}
      <div className="relative z-10 min-h-screen pb-24">
        <CafeDetail 
          cafe={cafe} 
          onClose={handleGoBack}
          pageBgColor={bgColor}
          userLocation={userLocation}
        />
      </div>
    </>
  );
};

export default CafeDetailPage; 