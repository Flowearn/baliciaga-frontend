import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertCircle,
  FileText,
  Loader2,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";

import ApplicationCard from '../components/ApplicationCard';
import { 
  fetchMyApplications, 
  MyApplication, 
  FetchMyApplicationsParams 
} from '@/services/applicationService';

type ApplicationStatus = 'all' | 'pending' | 'accepted' | 'rejected' | 'signed';

const MyApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<MyApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ApplicationStatus>('all');
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const loadApplications = async (
    status: ApplicationStatus = 'all', 
    cursor?: string, 
    append: boolean = false
  ) => {
    try {
      if (!append) {
        setIsLoading(true);
        setError(null);
      } else {
        setIsLoadingMore(true);
      }

      const params: FetchMyApplicationsParams = {
        status,
        limit: 10
      };

      if (cursor) {
        params.pageParam = cursor;
      }

      const response = await fetchMyApplications(params);

      if (response.success && response.data) {
        const newApplications = response.data.applications;
        
        if (append) {
          setApplications(prev => [...prev, ...newApplications]);
        } else {
          setApplications(newApplications);
        }

        setNextCursor(response.data.pagination.nextCursor);
        setHasNextPage(response.data.pagination.hasNextPage);
        setTotalCount(response.data.pagination.totalCount);
      } else {
        throw new Error(response.error?.message || 'Failed to fetch applications');
      }
    } catch (error: unknown) {
      console.error('Error loading applications:', error);
      
      const axiosError = error as { response?: { status: number } };
      const errorWithMessage = error as { message?: string };
      
      let errorMessage = 'Failed to load applications. Please try again.';
      
      if (axiosError.response?.status === 401) {
        errorMessage = 'Please sign in to view your applications.';
      } else if (axiosError.response?.status && axiosError.response.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (errorWithMessage.message) {
        errorMessage = errorWithMessage.message;
      }

      setError(errorMessage);
      
      if (!append) {
        toast.error('Failed to load applications', {
          description: errorMessage
        });
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    loadApplications(activeTab);
  }, [activeTab]);

  const handleTabChange = (status: ApplicationStatus) => {
    setActiveTab(status);
    setApplications([]);
    setNextCursor(null);
    setHasNextPage(false);
  };

  const handleLoadMore = () => {
    if (nextCursor && hasNextPage && !isLoadingMore) {
      loadApplications(activeTab, nextCursor, true);
    }
  };

  const handleRefresh = () => {
    setApplications([]);
    setNextCursor(null);
    setHasNextPage(false);
    loadApplications(activeTab);
  };

  const getStatusCount = (status: ApplicationStatus) => {
    if (status === 'all') return totalCount;
    return applications.filter(app => app.status === status).length;
  };

  if (isLoading) {
    return <MyApplicationsSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto pt-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
              <p className="text-gray-600 mt-1">
                Track the status of your rental applications
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Status Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => handleTabChange(value as ApplicationStatus)}>
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="all" className="text-xs sm:text-sm">
              All ({totalCount})
            </TabsTrigger>
            <TabsTrigger value="pending" className="text-xs sm:text-sm">
              Pending
            </TabsTrigger>
            <TabsTrigger value="accepted" className="text-xs sm:text-sm">
              Accepted
            </TabsTrigger>
            <TabsTrigger value="rejected" className="text-xs sm:text-sm">
              Rejected
            </TabsTrigger>
            <TabsTrigger value="signed" className="text-xs sm:text-sm">
              Signed
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {applications.length === 0 ? (
              <EmptyState status={activeTab} />
            ) : (
              <>
                {/* Applications List */}
                <div className="space-y-0">
                  {applications.map((application) => (
                    <ApplicationCard
                      key={application.applicationId}
                      application={application}
                    />
                  ))}
                </div>

                {/* Load More Button */}
                {hasNextPage && (
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="outline"
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className="min-w-[120px]"
                    >
                      {isLoadingMore ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        `Load More`
                      )}
                    </Button>
                  </div>
                )}

                {/* Results Summary */}
                <div className="text-center text-sm text-gray-500 pt-4">
                  Showing {applications.length} of {totalCount} applications
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Empty State Component
const EmptyState: React.FC<{ status: ApplicationStatus }> = ({ status }) => {
  const getEmptyMessage = () => {
    switch (status) {
      case 'pending':
        return {
          title: 'No pending applications',
          description: 'You don\'t have any applications waiting for review.'
        };
      case 'accepted':
        return {
          title: 'No accepted applications',
          description: 'You haven\'t received any acceptances yet.'
        };
      case 'rejected':
        return {
          title: 'No rejected applications',
          description: 'None of your applications have been rejected.'
        };
      case 'signed':
        return {
          title: 'No signed applications',
          description: 'You haven\'t signed any rental agreements yet.'
        };
      default:
        return {
          title: 'No applications yet',
          description: 'You haven\'t submitted any rental applications. Start browsing properties to find your perfect home!'
        };
    }
  };

  const message = getEmptyMessage();

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <FileText className="w-12 h-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {message.title}
        </h3>
        <p className="text-gray-600 text-center max-w-md mb-6">
          {message.description}
        </p>
        {status === 'all' && (
          <Button onClick={() => window.location.href = '/listings'}>
            Browse Properties
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

// Loading Skeleton Component
const MyApplicationsSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>

        <Skeleton className="h-10 w-full mb-6" />

        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="mb-4">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyApplicationsPage; 