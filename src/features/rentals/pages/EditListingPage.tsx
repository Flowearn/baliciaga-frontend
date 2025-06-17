import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { MyListing } from '@/services/listingService';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import ColoredPageWrapper from '@/components/layout/ColoredPageWrapper';

// 导入专用的EditListingForm组件
import EditListingForm from '../components/EditListingForm';

const EditListingPage: React.FC = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<MyListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 简化：从localStorage或parent状态获取listing数据
    // 或者实现一个简单的查找逻辑
    const findListingFromCache = () => {
      try {
        const cachedListings = localStorage.getItem('my-listings-cache');
        if (cachedListings && listingId) {
          const listings: MyListing[] = JSON.parse(cachedListings);
          const found = listings.find(l => l.listingId === listingId);
          if (found) {
            setListing(found);
            setIsLoading(false);
            return;
          }
        }
        
        // 如果缓存中没有找到，返回错误
        setError('Listing not found in cache. Please return to My Listings page.');
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading listing from cache:', error);
        setError('Failed to load listing data');
        setIsLoading(false);
      }
    };

    findListingFromCache();
  }, [listingId]);

  const handleBack = () => {
    navigate('/my-listings');
  };

  const handleUpdateSuccess = () => {
    navigate('/my-listings');
  };

  if (isLoading) {
    return (
      <ColoredPageWrapper seed="edit">
        <div className="sticky top-0 z-50 bg-black/40 backdrop-blur-sm py-3 px-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
            <h1 className="text-white font-semibold text-xl">Edit Listing</h1>
            <div className="w-16"></div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-white/60" />
            <p className="text-white/70">Loading listing details...</p>
          </div>
        </div>
      </ColoredPageWrapper>
    );
  }

  if (error || !listing) {
    return (
      <ColoredPageWrapper seed="edit">
        <div className="sticky top-0 z-50 bg-black/40 backdrop-blur-sm py-3 px-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
            <h1 className="text-white font-semibold text-xl">Edit Listing</h1>
            <div className="w-16"></div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-white text-xl mb-2">Error Loading Listing</h2>
            <p className="text-white/70 mb-4">{error}</p>
            <Button onClick={handleBack} className="bg-white/20 hover:bg-white/30">
              Go Back
            </Button>
          </div>
        </div>
      </ColoredPageWrapper>
    );
  }

  return (
    <ColoredPageWrapper seed="edit">
      <div className="sticky top-0 z-50 bg-black/40 backdrop-blur-sm py-3 px-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <h1 className="text-white font-semibold text-xl">Edit Listing</h1>
          <div className="w-16"></div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {listing && (
          <EditListingForm
            listing={listing}
            onUpdateSuccess={handleUpdateSuccess}
          />
        )}
      </div>
    </ColoredPageWrapper>
  );
};

export default EditListingPage; 