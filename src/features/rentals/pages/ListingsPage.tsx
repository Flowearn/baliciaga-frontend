import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Plus } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';

import { Listing, ListingsPagination } from '@/types';
import { fetchListings } from '@/services/listingService';
import ListingCard from '../components/ListingCard';
import ListingCardSkeleton from '../components/ListingCardSkeleton';

const ListingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [pagination, setPagination] = useState<ListingsPagination>({
    hasMore: false,
    nextCursor: null,
    totalCount: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initial data load
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetchListings({ limit: 10 });
      
      if (response.success) {
        setListings(response.data.listings);
        setPagination(response.data.pagination);
      } else {
        throw new Error('Failed to fetch listings');
      }
    } catch (error) {
      console.error('Error loading listings:', error);
      const errorMessage = 'Failed to load rental listings. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreListings = async () => {
    if (!pagination.nextCursor || isLoadingMore) return;

    try {
      setIsLoadingMore(true);
      setError(null);

      const response = await fetchListings({ 
        pageParam: pagination.nextCursor, 
        limit: 10 
      });

      if (response.success) {
        setListings(prev => [...prev, ...response.data.listings]);
        setPagination(response.data.pagination);
      } else {
        throw new Error('Failed to fetch more listings');
      }
    } catch (error) {
      console.error('Error loading more listings:', error);
      const errorMessage = 'Failed to load more listings. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleCardClick = (listingId: string) => {
    navigate(`/listings/${listingId}`);
  };

  const handleCreateListing = () => {
    navigate('/listings/create');
  };

  const handleRetry = () => {
    if (listings.length === 0) {
      loadInitialData();
    } else {
      loadMoreListings();
    }
  };

  // Loading state for initial load
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Find Roommate</h1>
              <p className="text-gray-600 mt-2">Discover available rental properties</p>
            </div>
            <Button onClick={handleCreateListing} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Post a Listing
            </Button>
          </div>

          {/* Loading Skeletons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <ListingCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Find Roommate</h1>
            <p className="text-gray-600 mt-2">
              {pagination.totalCount > 0 
                ? `${pagination.totalCount} available rental${pagination.totalCount !== 1 ? 's' : ''}`
                : 'Discover available rental properties'
              }
            </p>
          </div>
          <Button onClick={handleCreateListing} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Post a Listing
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetry}
                className="ml-4"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Empty State */}
        {!isLoading && listings.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
              <p className="text-gray-500 mb-6">
                Be the first to post a rental listing in your area.
              </p>
              <Button onClick={handleCreateListing} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Post the First Listing
              </Button>
            </div>
          </div>
        )}

        {/* Listings Grid */}
        {listings.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.listingId}
                  listing={listing}
                  onCardClick={handleCardClick}
                />
              ))}
            </div>

            {/* Load More Button */}
            {pagination.hasMore && (
              <div className="text-center">
                <Button
                  onClick={loadMoreListings}
                  disabled={isLoadingMore}
                  variant="outline"
                  size="lg"
                  className="min-w-32"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}

            {/* End of Results Message */}
            {!pagination.hasMore && listings.length > 0 && (
              <div className="text-center py-6">
                <p className="text-gray-500">
                  You've seen all {listings.length} available listing{listings.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ListingsPage; 