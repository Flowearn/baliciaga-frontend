import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { fetchPlaceDetails } from '../services/cafeService';
import { type Cafe } from '../types';
import CafeDetail from '@/components/CafeDetail';
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { slugify } from '@/utils/slugify';
import { useDescriptions } from '@/contexts/DescriptionsContext';

const CafeDetailPage: React.FC = () => {
  const { placeId } = useParams<{ placeId: string }>();
  const [searchParams] = useSearchParams();
  const categoryType = searchParams.get('type') as 'cafe' | 'bar' | 'cowork' | 'food' || 'cafe';
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { i18n } = useTranslation('common');
  
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

  // Fetch master description data using React Query
  const { data: descriptionData } = useQuery({
    queryKey: ['descriptions', i18n.language],
    queryFn: async () => {
      try {
        // Normalize language code to base language (e.g., zh-CN -> zh)
        const baseLanguage = i18n.language.split('-')[0];
        const url = `/locales/${baseLanguage}/descriptions.${baseLanguage}.json`;
        
        const response = await fetch(url);
        
        // Check if response is HTML (404 page)
        const contentType = response.headers.get('content-type');
        if (!response.ok || !contentType?.includes('application/json')) {
          console.log('Description data not found for language:', baseLanguage);
          return null;
        }
        
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Failed to fetch description data:', error);
        return null;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - cache descriptions
  });

  // Extract venue description from master data
  const venueDescription = descriptionData?.[placeId] || null;

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

  /**
   * 智能返回处理函数
   */
  const handleGoBack = () => {
    // 通过检查 history.state.idx 判断是否存在站内浏览历史
    // 第一次直接加载的页面 idx 为 0
    if (window.history.state && window.history.state.idx > 0) {
      // 场景一：正常流程，直接后退
      navigate(-1);
    } else {
      // 场景二：深度链接流程
      const type = searchParams.get('type'); // 从 URL (例如 ?type=bar) 中获取 'type' 的值

      if (type) {
        // 如果URL中存在type参数，则导航到带此参数的首页
        navigate(`/?type=${type}`);
      } else {
        // 如果URL中没有type参数，作为最终备用方案，导航到绝对首页
        navigate('/');
      }
    }
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
  // Construct canonical URL and get first image for social sharing
  const canonicalUrl = `https://baliciaga.com${location.pathname}${location.search}`;
  const ogImageUrl = cafe.photos && cafe.photos.length > 0 
    ? cafe.photos[0] 
    : 'https://baliciaga-database.s3.ap-southeast-1.amazonaws.com/image/rental-open-1.png';
  const metaDescription = `Explore ${cafe.name}. See reviews, photos, and opening hours for this ${categoryType} at ${cafe.formatted_address || cafe.vicinity || 'Bali'}. ${cafe.rating ? `Rated ${cafe.rating} stars.` : ''}`;
  const metaTitle = `${cafe.name} - ${categoryType.charAt(0).toUpperCase() + categoryType.slice(1)} in Bali | Baliciaga`;

  return (
    <>
      <Helmet>
        {/* Basic SEO tags */}
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        
        {/* Open Graph tags (Facebook, WhatsApp, LinkedIn) */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="Baliciaga" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={ogImageUrl} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>
      
      {/* Background layer that starts from the very top */}
      <div 
        className="fixed inset-0 z-0"
        style={{ backgroundColor: bgColor }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>
      
      {/* Content layer */}
      <div className="relative z-10 min-h-screen pb-24">
        <div className="max-w-xl mx-auto sm:px-6 lg:px-8">
          <CafeDetail 
            cafe={cafe} 
            onClose={handleGoBack}
            pageBgColor={bgColor}
            userLocation={userLocation}
            sections={venueDescription?.sections}
          />
        </div>
      </div>
    </>
  );
};

export default CafeDetailPage; 