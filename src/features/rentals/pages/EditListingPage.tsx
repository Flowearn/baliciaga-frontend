import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { MyListing, fetchListingById } from '@/services/listingService';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import ColoredPageWrapper from '@/components/layout/ColoredPageWrapper';

// 导入专用的EditListingForm组件
import EditListingForm from '../components/EditListingForm';

const EditListingPage: React.FC = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [listing, setListing] = useState<MyListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadListing = async () => {
      if (!listingId) {
        setError('No listing ID provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Fetch the listing directly from the API
        const response = await fetchListingById(listingId);
        
        if (response.success && response.data) {
          // Convert the Listing to MyListing format
          const fetchedListing = response.data;
          const myListing: MyListing = {
            listingId: fetchedListing.listingId,
            title: fetchedListing.title,
            description: fetchedListing.description || '',
            initiatorId: fetchedListing.initiatorId,
            pricing: fetchedListing.pricing,
            details: fetchedListing.details,
            location: fetchedListing.location,
            availability: fetchedListing.availability,
            photos: fetchedListing.photos || [],
            amenities: fetchedListing.amenities || [],
            status: fetchedListing.status,
            createdAt: fetchedListing.createdAt,
            updatedAt: fetchedListing.updatedAt,
            applicationsCount: 0, // These fields are not available in the regular listing API
            viewsCount: 0
          };
          setListing(myListing);
        } else {
          setError('Failed to load listing details');
        }
      } catch (error) {
        console.error('Error loading listing:', error);
        setError('Failed to load listing. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadListing();
  }, [listingId]);

  const handleBack = () => {
    // Navigate back to where user came from, or default to my-listings
    const from = location.state?.from || '/my-listings';
    navigate(from);
  };

  const handleUpdateSuccess = () => {
    // Navigate back to where user came from after successful update
    const from = location.state?.from || '/my-listings';
    navigate(from);
  };

  if (isLoading) {
    return (
      <ColoredPageWrapper seed="edit">
        {/* Sticky Header - Consistent with CafeDetail */}
        <div className="sticky top-0 z-50 py-3 px-4" style={{ height: 'calc(16px + 1.5rem)' }}>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleBack}
            className="p-0 h-auto w-auto bg-transparent hover:bg-transparent"
          >
            <ArrowLeft className="h-5 w-5 text-white/90" />
          </Button>
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
        {/* Sticky Header - Consistent with CafeDetail */}
        <div className="sticky top-0 z-50 py-3 px-4" style={{ height: 'calc(16px + 1.5rem)' }}>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleBack}
            className="p-0 h-auto w-auto bg-transparent hover:bg-transparent"
          >
            <ArrowLeft className="h-5 w-5 text-white/90" />
          </Button>
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
      {/* Sticky Header - Consistent with CafeDetail */}
      <div className="sticky top-0 z-50 py-3 px-4" style={{ height: 'calc(16px + 1.5rem)' }}>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleBack}
          className="p-0 h-auto w-auto bg-transparent hover:bg-transparent"
        >
          <ArrowLeft className="h-5 w-5 text-white/90" />
        </Button>
      </div>

      <div className="relative z-10 container mx-auto px-4 pt-8 pb-24 max-w-4xl">
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