import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchCafeDetails } from '../services/cafeService';
import { type Cafe } from '../types';
import CafeDetail from '@/components/CafeDetail';
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const CafeDetailPage: React.FC = () => {
  const { placeId } = useParams<{ placeId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  
  // State for random background color
  const [bgColor, setBgColor] = useState<string>('');
  
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
  
  // Extract the cafe data from location state if available
  const initialCafeData = location.state?.cafeData as Cafe | undefined;

  // Try to get existing data from cache if available
  const existingData = queryClient.getQueryData<Cafe>(['cafeDetails', placeId]);

  // Fetch cafe details using React Query with initialData
  const { data: cafe, isLoading, error } = useQuery({
    queryKey: ['cafeDetails', placeId],
    queryFn: () => placeId ? fetchCafeDetails(placeId) : Promise.reject('No placeId provided'),
    enabled: !!placeId,
    // Use either the data passed via navigation state or existing cache data
    initialData: initialCafeData || existingData,
    // Use a longer staleTime to reduce unnecessary refetching
    staleTime: 5 * 60 * 1000, // 5 minutes
    // If we have initialData, disable the loading indicator
    ...(initialCafeData && { placeholderData: initialCafeData })
  });

  // Prefetch related cafes when initial data is loaded
  useEffect(() => {
    if (cafe && cafe.types && cafe.types.length > 0) {
      // We could potentially prefetch other related cafes here
      // For example, we could fetch cafes with similar types or nearby location
      // This is just a placeholder for potential future optimizations
    }
  }, [cafe, queryClient]);

  // Show error message when request fails
  useEffect(() => {
    if (error) {
      toast({
        title: "Failed to load cafe details",
        description: "Unable to fetch cafe details. Please try again later.",
        variant: "destructive"
      });
      console.error("Error loading cafe details:", error);
    }
  }, [error]);

  const handleGoBack = () => {
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
        <h2 className="text-2xl font-bold mb-4">Cafe not found</h2>
        <p className="mb-6 text-center">The cafe you're looking for could not be found or there was an error loading it.</p>
        <Button onClick={handleGoBack} variant="outline" className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  // Display cafe detail (back button removed)
  return (
    <div 
      className="relative w-full py-8 overflow-y-auto"
      style={{ backgroundColor: bgColor }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-40 z-1 pointer-events-none"></div>
      
      <CafeDetail 
        cafe={cafe} 
        onClose={handleGoBack}
      />
    </div>
  );
};

export default CafeDetailPage; 