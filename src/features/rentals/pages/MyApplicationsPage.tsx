import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AlertCircle,
  FileText,
  Loader2,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';
import ColoredPageWrapper from '@/components/layout/ColoredPageWrapper';

import MyApplicationCard from '../components/MyApplicationCard';
import { 
  fetchMyApplications, 
  MyApplication, 
  FetchMyApplicationsParams 
} from '@/services/applicationService';

const MyApplicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthenticator((context) => [context.user]);
  const [applications, setApplications] = useState<MyApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const loadApplications = async (
    cursor?: string | null, 
    append: boolean = false
  ) => {
    try {
      // 重置错误状态并设置加载状态
      if (!append) {
        setIsLoading(true);
        setError(null);
      } else {
        setIsLoadingMore(true);
      }

      const params: FetchMyApplicationsParams = {
        limit: 10
      };

      if (cursor) {
        params.pageParam = cursor;
      }

      console.log('Making API request with params:', params);
      const response = await fetchMyApplications(params);
      console.log('API response received:', response);

      // 更健壮的响应处理 - 匹配后端实际返回的响应格式
      let newApplications: MyApplication[] = [];
      let pagination: { nextCursor?: string | null; hasMore?: boolean; total?: number } | null = null;

      if (response && typeof response === 'object') {
        // Since apiClient returns response.data, the actual data is directly in response
        if ('applications' in response) {
          newApplications = response.applications || [];
          pagination = response.pagination || null;
          
        }
      }

      console.log('Processed applications:', newApplications.length, 'items');

      // 根据是否为"加载更多"来决定如何更新状态
      if (append) {
        setApplications(prev => [...prev, ...newApplications]);
      } else {
        setApplications(newApplications);
      }

      // 更新分页状态
      setNextCursor(pagination?.nextCursor || null);
      setHasNextPage(pagination?.hasMore || false);
      setTotalCount(pagination?.total || newApplications.length);

    } catch (error: unknown) {
      console.error('Error loading applications:', error);
      
      const axiosError = error as { response?: { status: number } };
      const errorWithMessage = error as { message?: string };
      
      let errorMessage = 'Failed to load applications. Please try again.';
      
      if (axiosError.response?.status === 401) {
        errorMessage = 'Please log in to view your applications.';
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
    loadApplications();
  }, []);

  const handleLoadMore = () => {
    if (nextCursor && hasNextPage && !isLoadingMore) {
      loadApplications(nextCursor, true);
    }
  };

  const handleRefresh = () => {
    setApplications([]);
    setNextCursor(null);
    setHasNextPage(false);
    loadApplications();
  };

  const handleApplicationCanceled = (applicationId: string) => {
    // 从当前列表中移除已取消的申请
    setApplications(prev => prev.filter(app => app.applicationId !== applicationId));
    // 更新总数
    setTotalCount(prev => Math.max(0, prev - 1));
    
    toast.success('Application has been removed from your list');
  };

  if (isLoading) {
    return (
      <ColoredPageWrapper seed="applications">
        <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
          <div className="space-y-2">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-black/40 backdrop-blur-sm rounded-xl p-4 shadow-md">
                <div className="flex gap-4">
                  <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-white/20" />
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-5 w-3/4 bg-white/20" />
                      <Skeleton className="h-6 w-16 bg-white/20" />
                    </div>
                    <Skeleton className="h-4 w-full bg-white/20" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-24 bg-white/20" />
                      <Skeleton className="h-4 w-20 bg-white/20" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-32 bg-white/20" />
                      <Skeleton className="h-8 w-24 bg-white/20" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ColoredPageWrapper>
    );
  }

  if (error) {
    return (
      <ColoredPageWrapper seed="applications">
        <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
          <div className="bg-black/40 backdrop-blur-sm rounded-2xl flex flex-col items-center p-8 text-white/80">
            <AlertCircle className="h-12 w-12 stroke-red-400 mb-4" />
            <h3 className="text-base font-semibold mb-2 text-white">Something went wrong</h3>
            <p className="text-white/80 mb-6 max-w-sm text-center">{error}</p>
            <Button 
              onClick={handleRefresh}
              className="bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-2"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Retry
            </Button>
          </div>
        </div>
      </ColoredPageWrapper>
    );
  }

  return (
    <ColoredPageWrapper seed="applications">
      <div className="relative z-10 container mx-auto px-4 py-4 sm:py-8 max-w-4xl">

        {/* Applications List */}
        {applications.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="space-y-0">
              {applications.map((application) => (
                <MyApplicationCard
                  key={application.applicationId}
                  application={application}
                  onApplicationCanceled={handleApplicationCanceled}
                />
              ))}
            </div>

            {/* Load More Button */}
            {hasNextPage && (
              <div className="flex justify-center pt-4">
                <Button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="bg-white/20 hover:bg-white/30 text-white rounded-full px-6 py-2 min-w-[120px]"
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
            <div className="text-center text-base text-white/80 pt-4 pb-4">
              Showing {applications.length} of {totalCount} applications
            </div>
          </>
        )}
      </div>
    </ColoredPageWrapper>
  );
};

// Empty State Component
const EmptyState: React.FC = () => {
  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-2xl flex flex-col items-center p-8 text-white/80">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="stroke-white/60 mb-4">
        <path d="M12 22a10 10 0 1 0-10-10h.01"/>
        <path d="M17 10a5 5 0 0 0-5-5h-1.5"/>
      </svg>
      <h3 className="text-base font-semibold text-white/100">No applications yet</h3>
      <p className="mt-2 text-base text-white/80 text-center">You haven't submitted any rental applications. Start browsing properties to find your perfect home!</p>
      <Button className="mt-4 bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-2" onClick={() => window.location.href = '/listings'}>
        Browse Properties
      </Button>
    </div>
  );
};

export default MyApplicationsPage; 