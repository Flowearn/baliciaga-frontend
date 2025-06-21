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
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ColoredPageWrapper from '@/components/layout/ColoredPageWrapper';

const MyListingsPage: React.FC = () => {
  const navigate = useNavigate();
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
    { value: 'paused', label: 'Cancelled', icon: XCircle },
    { value: 'closed', label: 'Finalized', icon: CheckCircle },
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
        let newListings = response.data.listings;
        
        // No filtering needed - show all listings regardless of status
        
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

  // Handle card click to navigate to listing detail
  const handleCardClick = (listingId: string) => {
    navigate(`/my-listings/${listingId}`, { state: { from: '/my-listings' } });
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-black/40 backdrop-blur-sm rounded-xl p-4 shadow-md">
          <div className="flex gap-4">
            <Skeleton className="w-24 h-24 rounded-lg bg-white/20" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-3/4 bg-white/20" />
              <Skeleton className="h-4 w-1/2 bg-white/20" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-20 bg-white/20" />
                <Skeleton className="h-4 w-20 bg-white/20" />
                <Skeleton className="h-4 w-24 bg-white/20" />
              </div>
              <div className="flex gap-4">
                <Skeleton className="h-8 w-32 bg-white/20" />
                <Skeleton className="h-8 w-24 bg-white/20" />
              </div>
            </div>
          </div>
        </div>
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
        case 'paused':
          return {
            icon: XCircle,
            title: 'No cancelled listings',
            description: 'You don\'t have any cancelled listings.',
            action: null
          };
        case 'closed':
          return {
            icon: CheckCircle,
            title: 'No finalized listings',
            description: 'You don\'t have any finalized listings.',
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
      <div className="bg-black/40 backdrop-blur-sm rounded-2xl flex flex-col items-center p-8 text-white/80">
        <Icon className="h-12 w-12 stroke-white/60 mb-4" />
        <h3 className="text-base font-semibold mb-2 text-white/100">{title}</h3>
        <p className="text-white/80 mb-6 max-w-sm text-center">{description}</p>
        {action && (
          <Link to="/rentals/create">
            <Button className="bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-2">
              <PlusCircle className="h-4 w-4 mr-2" />
              {action}
            </Button>
          </Link>
        )}
      </div>
    );
  };

  // Error state
  const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
    <div className="bg-black/40 backdrop-blur-sm rounded-2xl flex flex-col items-center p-8 text-white/80">
      <AlertCircle className="h-12 w-12 stroke-red-400 mb-4" />
      <h3 className="text-base font-semibold mb-2 text-white/100">Something went wrong</h3>
      <p className="text-white/80 mb-6 max-w-sm text-center">{error}</p>
      <Button onClick={onRetry} className="bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-2">
        <RefreshCw className="h-4 w-4 mr-2" />
        Try again
      </Button>
    </div>
  );

  // 添加关键诊断日志 - 在 return 语句之前
  console.log(
    '%c[MyListingsPage DIAGNOSIS] State before render:',
    'color: purple; font-weight: bold;',
    {
      isLoading,
      error,
      listings,
      listingsCount: listings?.length,
      activeTab,
    }
  );

  return (
    <ColoredPageWrapper seed="listings">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-black/40 backdrop-blur-sm py-4 px-4 border-b border-white/10">
        <h1 className="text-white font-semibold text-xl text-center">My Listings</h1>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-4 sm:py-8 pb-20 max-w-4xl">
        {/* Status Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4 bg-black/20 border-white/20">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.value;
              return (
                <TabsTrigger 
                  key={tab.value} 
                  value={tab.value} 
                  className={`flex items-center gap-2 ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

        <TabsContent value={activeTab}>
          {isLoading ? (
            <LoadingSkeleton />
          ) : error ? (
            <ErrorState onRetry={handleRetry} />
          ) : listings.length > 0 ? (
            <div className="space-y-4">
              {listings.map((listing) => (
                <MyListingCard key={listing.listingId} listing={listing} onCardClick={handleCardClick} />
              ))}
              {hasNextPage && (
                                  <div className="flex justify-center mt-8">
                    <Button 
                      onClick={handleLoadMore} 
                      disabled={isLoadingMore}
                      className="bg-white/20 hover:bg-white/30 text-white rounded-full px-6 py-2"
                    >
                      {isLoadingMore ? 'Loading...' : 'Load More'}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState status={activeTab} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ColoredPageWrapper>
  );
};

export default MyListingsPage; 