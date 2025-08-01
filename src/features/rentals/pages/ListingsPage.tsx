import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus } from "lucide-react";
import { toast } from 'sonner';
import { fetchListings } from '@/services/listingService';
import { Listing, ListingsApiResponse } from '@/types';
import ListingCard from '../components/ListingCard';
import ListingCardSkeleton from '../components/ListingCardSkeleton';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';


const ListingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load listings function
  const loadListings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Always fetch all listings, but filter on frontend
      const response: ListingsApiResponse = await fetchListings({
        limit: 50, // Get more listings for the main page
        includeStatus: ['active', 'open'] // Fetch only active and open statuses
      });

      if (response.success) {
        const fetchedListings = response.data.listings;
        
        // Always filter out paused listings
        const filteredListings = fetchedListings.filter(listing => listing.status !== 'cancelled');
          
        setListings(filteredListings);
        
        // 添加诊断日志
        console.log('%c[DIAGNOSTIC LOG] Fetched listings:', 'color: green; font-weight: bold;', fetchedListings.length);
        console.log('%c[DIAGNOSTIC LOG] Filtered listings:', 'color: green; font-weight: bold;', filteredListings.length);
        
        // Log status distribution
        const statusCount = fetchedListings.reduce((acc, listing) => {
          acc[listing.status] = (acc[listing.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        console.log('%c[DIAGNOSTIC LOG] Status distribution:', 'color: orange; font-weight: bold;', statusCount);
        
        if (filteredListings.length > 0) {
          console.log('%c[DIAGNOSTIC LOG] Sample listing structure:', 'color: green; font-weight: bold;', filteredListings[0]);
        }
      } else {
        throw new Error('Failed to fetch listings');
      }
    } catch (error: unknown) {
      console.error('Error fetching listings:', error);
      
      let errorMessage = 'Failed to load listings';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === 'object' && 'response' in error) {
        const response = (error as { response?: { data?: { error?: { message?: string } } } }).response;
        errorMessage = response?.data?.error?.message || errorMessage;
      }
      
      setError(errorMessage);
      toast.error('Failed to load listings', {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load listings on component mount
  useEffect(() => {
    loadListings();
  }, []);

  // Handle card click - navigate to listing detail
  const handleCardClick = (listingId: string) => {
    navigate(`/listings/${listingId}`, { state: { from: '/listings' } });
  };

  // Handle retry
  const handleRetry = () => {
    loadListings();
  };

  return (
    <div className="min-h-screen bg-background-creamy">
              <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-24">
        {/* Header with Post Villa Button */}
        <div className="flex gap-3 mb-6">
          {/* Post Villa Button */}
          <Button
            className="h-[64px] flex-1 border-2 border-[#B7AC93] text-[#B7AC93] rounded-3xl flex flex-col items-center justify-center gap-1 bg-transparent hover:bg-[#B7AC93]/10 active:bg-[#B7AC93]/20 post-listing-btn"
            asChild
          >
            <Link to="/create-listing">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#B7AC93]">
                <Plus className="h-4 w-4 text-white" />
              </span>
              <span className="text-sm font-medium">Post villas & Find roommates</span>
            </Link>
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            <ListingCardSkeleton />
            <ListingCardSkeleton />
            <ListingCardSkeleton />
            <ListingCardSkeleton />
            <ListingCardSkeleton />
            <ListingCardSkeleton />
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="mb-6">
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 shadow-md">
              <div className="flex items-center text-red-400 mb-4">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span className="text-white/100 font-medium">Something went wrong</span>
              </div>
              <p className="text-white/80 mb-4">{error}</p>
              <Button 
                onClick={handleRetry}
                className="bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-2"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Listings Grid */}
        {!isLoading && !error && (
          <>
            {listings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                {listings.map((listing) => (
                  <ListingCard 
                    key={listing.listingId} 
                    listing={listing}
                    onCardClick={handleCardClick}
                    isArchived={false}
                  />
                ))}
              </div>
            ) : (
              <div>
                <div className="bg-black/40 backdrop-blur-sm rounded-xl p-8 text-center shadow-md">
                  <div className="text-white/60 mb-4">
                    <Plus className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold mb-2 text-white">No listings available</h3>
                    <p className="text-white/80">Be the first to post a villa and find roommates!</p>
                  </div>
                  <Link to="/create-listing">
                    <Button className="bg-white/20 hover:bg-white/30 text-white rounded-full px-6 py-2">
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Listing
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ListingsPage; 