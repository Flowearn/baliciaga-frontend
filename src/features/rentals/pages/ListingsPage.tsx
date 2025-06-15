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

      const response: ListingsApiResponse = await fetchListings({
        limit: 50 // Get more listings for the main page
      });

      if (response.success) {
        const fetchedListings = response.data.listings;
        setListings(fetchedListings);
        
        // 添加诊断日志
        console.log('%c[DIAGNOSTIC LOG] Listings stored in state:', 'color: green; font-weight: bold;', fetchedListings);
        console.log('%c[DIAGNOSTIC LOG] Number of listings:', 'color: green; font-weight: bold;', fetchedListings.length);
        
        if (fetchedListings.length > 0) {
          console.log('%c[DIAGNOSTIC LOG] Sample listing structure:', 'color: green; font-weight: bold;', fetchedListings[0]);
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
    navigate(`/listings/${listingId}`);
  };

  // Handle retry
  const handleRetry = () => {
    loadListings();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Post Villa Button */}
        <Link
          to="/create-listing"
          className="flex flex-col items-center justify-center p-3 mb-6 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 hover:border-brand transition-colors"
        >
          <div className="flex items-center justify-center w-12 h-12 mb-2 bg-brand rounded-full">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <p className="font-semibold">Post villas & Find roommates</p>
        </Link>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={handleRetry}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Listings Grid */}
        {!isLoading && !error && (
          <>
            {listings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {listings.map((listing) => (
                  <ListingCard 
                    key={listing.listingId} 
                    listing={listing}
                    onCardClick={handleCardClick}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">
                  <Plus className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No listings available</h3>
                  <p>Be the first to post a villa and find roommates!</p>
                </div>
                <Link to="/create-listing">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Listing
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ListingsPage; 