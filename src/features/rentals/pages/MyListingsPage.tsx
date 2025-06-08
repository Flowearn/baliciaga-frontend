import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { fetchMyListings, MyListing, MyListingsApiResponse } from '@/services/listingService';
import MyListingCard from '../components/MyListingCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  RefreshCw, 
  AlertCircle, 
  Home, 
  PlusCircle,
  FileText,
  Clock,
  CheckCircle
} from 'lucide-react';

const MyListingsPage: React.FC = () => {
  const [listings, setListings] = useState<MyListing[]>([]);
  const [activeTab, setActiveTab] = useState<string>('active');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Tab configuration
  const tabs = [
    { value: 'all', label: 'All', icon: FileText },
    { value: 'active', label: 'Active', icon: CheckCircle },
    { value: 'draft', label: 'Draft', icon: Clock },
    { value: 'expired', label: 'Expired', icon: AlertCircle },
  ];

  // Fetch listings based on current tab
  const loadListings = async (status: string, cursor?: string, isLoadMore = false) => {
    try {
      if (!isLoadMore) {
        setIsLoading(true);
        setError(null);
      } else {
        setIsLoadingMore(true);
      }

      const response: MyListingsApiResponse = await fetchMyListings({
        status,
        pageParam: cursor,
        limit: 10
      });

      if (response.success) {
        const newListings = response.data.listings;
        
        if (isLoadMore && cursor) {
          setListings(prev => [...prev, ...newListings]);
        } else {
          setListings(newListings);
        }

        setNextCursor(response.data.pagination.nextCursor);
        setHasNextPage(response.data.pagination.hasNextPage);
      } else {
        throw new Error(response.error?.message || 'Failed to fetch listings');
      }
    } catch (error: unknown) {
      console.error('Error fetching listings:', error);
      
      let errorMessage = 'Failed to load your listings';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === 'object' && 'response' in error) {
        const response = (error as { response?: { data?: { error?: { message?: string } } } }).response;
        errorMessage = response?.data?.error?.message || errorMessage;
      }
      setError(errorMessage);
      
      if (!isLoadMore) {
        toast.error('Failed to load listings', {
          description: errorMessage
        });
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Initial load and tab change
  useEffect(() => {
    loadListings(activeTab);
  }, [activeTab]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setListings([]);
    setNextCursor(null);
    setHasNextPage(false);
  };

  // Handle load more
  const handleLoadMore = () => {
    if (nextCursor && hasNextPage && !isLoadingMore) {
      loadListings(activeTab, nextCursor, true);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    setListings([]);
    setNextCursor(null);
    setHasNextPage(false);
    loadListings(activeTab);
  };

  // Retry on error
  const handleRetry = () => {
    setError(null);
    loadListings(activeTab);
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <Skeleton className="w-24 h-24 rounded-lg" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex gap-4">
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Empty state for different tabs
  const EmptyState = ({ status }: { status: string }) => {
    const getEmptyStateContent = () => {
      switch (status) {
        case 'active':
          return {
            icon: Home,
            title: 'No active listings',
            description: 'You don\'t have any active rental listings yet.',
            action: 'Create your first listing'
          };
        case 'draft':
          return {
            icon: Clock,
            title: 'No draft listings',
            description: 'You don\'t have any draft listings.',
            action: 'Create a new listing'
          };
        case 'expired':
          return {
            icon: AlertCircle,
            title: 'No expired listings',
            description: 'You don\'t have any expired listings.',
            action: null
          };
        default:
          return {
            icon: FileText,
            title: 'No listings found',
            description: 'You haven\'t created any rental listings yet.',
            action: 'Create your first listing'
          };
      }
    };

    const { icon: Icon, title, description, action } = getEmptyStateContent();

    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Icon className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">{description}</p>
          {action && (
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              {action}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Listings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your rental property listings and applications
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Listing
          </Button>
        </div>
      </div>

      {/* Status Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            {/* Error State */}
            {error && !isLoading && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between w-full">
                  <span>{error}</span>
                  <Button variant="outline" size="sm" onClick={handleRetry}>
                    Try Again
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Loading State */}
            {isLoading ? (
              <LoadingSkeleton />
            ) : (
              <>
                {/* Listings Grid */}
                {listings.length > 0 ? (
                  <div className="space-y-6">
                    <div className="grid gap-6">
                      {listings.map((listing) => (
                        <MyListingCard key={listing.listingId} listing={listing} />
                      ))}
                    </div>

                    {/* Load More Button */}
                    {hasNextPage && (
                      <div className="flex justify-center pt-6">
                        <Button
                          variant="outline"
                          onClick={handleLoadMore}
                          disabled={isLoadingMore}
                        >
                          {isLoadingMore ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            'Load More'
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Empty State */
                  <EmptyState status={activeTab} />
                )}
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default MyListingsPage; 