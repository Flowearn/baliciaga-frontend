import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft,
  MapPin,
  Users,
  Bath,
  Home,
  Calendar,
  Banknote,
  Gauge,
  PawPrint,
  Cigarette,
  Wifi,
  Car,
  Dumbbell,
  UtensilsCrossed,
  Loader2,
  AlertCircle,
  MessageSquare,
  CheckCircle2,
  X,
  Edit
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from '@/context/AuthContext';
import ColoredPageWrapper from '@/components/layout/ColoredPageWrapper';

import { fetchListingById, incrementView, finalizeListing, cancelListing } from '@/services/listingService';
import { createApplication, fetchMyApplications } from '@/services/applicationService';
import ApplicationModal from '@/features/applications/components/ApplicationModal';
import InitiatorProfileCard from '@/features/rentals/components/InitiatorProfileCard';
import { Listing } from '@/types';
import { formatPrice } from '@/lib/utils';
import { pricePerRoom } from '@/utils/pricePerRoom';
import { formatNoYear } from '@/utils/formatDate';

// 格式化日期的简单函数
const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

const ListingDetailPage: React.FC = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser } = useAuth();
  
  const isMyListing = location.pathname.startsWith('/my-listings');
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOperating, setIsOperating] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [isAcceptedCandidate, setIsAcceptedCandidate] = useState(false);

  // 判断当前登录用户是否为房源发起人：比较内部业务主键 userId
  const isOwner = authUser?.userId && listing?.initiatorId === authUser.userId;

  useEffect(() => {
    const loadListing = async () => {
      if (!listingId) {
        setError('No listing ID provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetchListingById(listingId);
        
        if (response.success && response.data) {
          setListing(response.data);
          // 增加浏览量
          await incrementView(listingId);
          
          // Check if current user has an accepted application for this listing
          if (authUser?.userId) {
            try {
              const applicationsResponse = await fetchMyApplications({ limit: 100 });
              if (applicationsResponse.success && applicationsResponse.data) {
                const myApplicationForThisListing = applicationsResponse.data.applications.find(
                  app => app.listingId === listingId && app.status === 'accepted'
                );
                setIsAcceptedCandidate(!!myApplicationForThisListing);
              }
            } catch (appError) {
              console.error('Error checking application status:', appError);
              // Don't fail the whole page load if we can't check application status
            }
          }
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
  }, [listingId, authUser?.userId]);

  const handleApply = () => {
    if (!authUser) {
      toast.error('Please log in to apply for this listing');
      navigate('/login');
      return;
    }
    setShowApplicationModal(true);
  };

  const submitApplication = async (message: string) => {
    if (!listing || !authUser) return;

    try {
      await createApplication(listing.listingId, message);
      toast.success('Application submitted successfully!');
      setShowApplicationModal(false);
    } catch (error) {
      console.error('Submit application error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        const errorCode = error.response?.data?.error?.code;
        if (errorCode === 'SELF_APPLICATION_FORBIDDEN') {
          toast.error('You cannot apply to your own listing.');
        } else if (errorCode === 'LISTING_NOT_OPEN') {
          toast.error('This listing is no longer accepting applications.');
        } else if (errorCode === 'DUPLICATE_APPLICATION') {
          toast.error('You have already applied to this listing.');
        } else {
          toast.error('Invalid application. Please check your input.');
        }
      } else if (error.response?.status === 404) {
        toast.error('Listing not found.');
      } else if (error.response?.status === 409) {
        toast.error('You have already applied to this listing.');
      } else {
        toast.error('Failed to submit application. Please try again.');
      }
    }
  };

  const handleFinalize = async () => {
    if (!listing || !authUser || !isOwner) return;

    try {
      setIsOperating(true);
      const response = await finalizeListing(listing.listingId);
      
      if (response.success) {
        toast.success('房源已成功完成组队！', {
          description: `${response.data?.updatedApplicationsCount || 0} 个申请已更新为已签约状态。`
        });
        
        // 更新本地状态
        setListing(prev => prev ? { ...prev, status: 'closed' as const } : null);
      } else {
        throw new Error(response.error?.message || 'Failed to finalize listing');
      }
    } catch (error: unknown) {
      console.error('Finalize listing error:', error);
      
      const axiosError = error as { response?: { status: number } };
      const errorWithMessage = error as { message?: string };
      
      if (axiosError.response?.status === 403) {
        toast.error('权限不足', {
          description: '只有招租信息的发起人可以完成组队。'
        });
      } else if (axiosError.response?.status === 404) {
        toast.error('招租信息不存在', {
          description: '找不到指定的招租信息。'
        });
      } else {
        toast.error('完成组队失败', {
          description: errorWithMessage.message || '操作失败，请稍后重试。'
        });
      }
    } finally {
      setIsOperating(false);
    }
  };

  const handleCancel = async () => {
    if (!listing || !authUser || !isOwner) return;

    try {
      setIsOperating(true);
      const response = await cancelListing(listing.listingId);
      
      if (response.success) {
        toast.success('房源已成功取消！');
        
        // 更新本地状态
        setListing(prev => prev ? { ...prev, status: 'paused' as const } : null);
      } else {
        throw new Error(response.error?.message || 'Failed to cancel listing');
      }
    } catch (error: unknown) {
      console.error('Cancel listing error:', error);
      
      const axiosError = error as { response?: { status: number } };
      const errorWithMessage = error as { message?: string };
      
      if (axiosError.response?.status === 403) {
        toast.error('权限不足', {
          description: '只有招租信息的发起人可以取消房源。'
        });
      } else if (axiosError.response?.status === 404) {
        toast.error('招租信息不存在', {
          description: '找不到指定的招租信息。'
        });
      } else {
        toast.error('取消房源失败', {
          description: errorWithMessage.message || '操作失败，请稍后重试。'
        });
      }
    } finally {
      setIsOperating(false);
    }
  };

  const getAmenityIcon = (amenity: string) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes('wifi') || amenityLower.includes('internet')) {
      return <Wifi className="w-4 h-4" />;
    }
    if (amenityLower.includes('parking') || amenityLower.includes('car')) {
      return <Car className="w-4 h-4" />;
    }
    if (amenityLower.includes('gym') || amenityLower.includes('fitness')) {
      return <Dumbbell className="w-4 h-4" />;
    }
    if (amenityLower.includes('kitchen') || amenityLower.includes('dining')) {
      return <UtensilsCrossed className="w-4 h-4" />;
    }
    return <Home className="w-4 h-4" />;
  };

  if (isLoading) {
    return (
      <ColoredPageWrapper seed={listingId || 'listing'}>
        <div className="sticky top-0 z-50 bg-black/40 backdrop-blur-sm py-4 px-4 border-b border-white/10">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const from = location.state?.from;
                if (from) {
                  navigate(from);
                } else {
                  // Fallback based on current route
                  const defaultBack = location.pathname.startsWith('/my-listings') 
                    ? '/my-listings' 
                    : '/listings';
                  navigate(defaultBack);
                }
              }}
              className="mr-3 p-2 hover:bg-white/20 rounded-full"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </Button>
            <Skeleton className="h-8 w-48 bg-white/20" />
          </div>
        </div>
        <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="w-full h-64 rounded-xl mb-6 bg-white/20" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4 bg-white/20" />
            <Skeleton className="h-4 w-full bg-white/20" />
            <Skeleton className="h-4 w-2/3 bg-white/20" />
          </div>
        </div>
      </ColoredPageWrapper>
    );
  }

  if (error || !listing) {
    return (
      <ColoredPageWrapper seed={listingId || 'listing'}>
        <div className="sticky top-0 z-50 bg-black/40 backdrop-blur-sm py-3 px-4 border-b border-white/10">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const from = location.state?.from;
                if (from) {
                  navigate(from);
                } else {
                  // Fallback based on current route
                  const defaultBack = location.pathname.startsWith('/my-listings') 
                    ? '/my-listings' 
                    : '/listings';
                  navigate(defaultBack);
                }
              }}
              className="mr-3 p-2 hover:bg-white/20 rounded-full"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </Button>
            <h1 className="text-white font-semibold text-xl text-center">Listing Not Found</h1>
          </div>
        </div>
        <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
          <div className="bg-black/40 backdrop-blur-sm rounded-2xl flex flex-col items-center p-8 text-white/80">
            <AlertCircle className="h-12 w-12 stroke-red-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-white">Something went wrong</h3>
            <p className="text-white/70 mb-6 max-w-sm text-center">{error}</p>
            <Button 
              onClick={() => navigate('/listings')}
              className="bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-2"
            >
              Browse Listings
            </Button>
          </div>
        </div>
      </ColoredPageWrapper>
    );
  }

  return (
    <ColoredPageWrapper seed={listingId || 'listing'}>
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 py-2 px-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const from = location.state?.from;
            if (from) {
              navigate(from);
            } else {
              // Fallback based on current route
              const defaultBack = location.pathname.startsWith('/my-listings') 
                ? '/my-listings' 
                : '/listings';
              navigate(defaultBack);
            }
          }}
          className="px-4 py-2 bg-black/40 hover:bg-black/60 rounded-full"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </Button>
      </div>

      <div className="relative z-10 container mx-auto px-4 pt-0 pb-24 max-w-4xl">
        {/* Main Photo */}
        {listing.photos && listing.photos.length > 0 && (
          <div className="mb-6">
            <img 
              src={listing.photos[0]} 
              alt={listing.title}
              className="w-full h-64 sm:h-72 object-cover rounded-xl shadow-lg"
            />
          </div>
        )}

        {/* Basic Info Card */}
        <Card className="mb-6 bg-black/40 backdrop-blur-sm shadow-lg border-none">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white/90 mb-2">{listing.title}</h1>
                <div className="flex items-center text-white/90 mb-3">
                  <MapPin className="w-3 h-3 mr-2" />
                  <span className="text-sm">{listing.location.address}</span>
                </div>
              </div>
              <div className="text-left">
                {/* Price per Room – Always show monthly (use equivalent if only yearly available) */}
                <div className="flex items-baseline gap-1 justify-start">
                  <span className="text-green-600 font-bold text-3xl">
                    {(() => {
                      // Calculate monthly price - always use monthly as base
                      let monthlyPrice = 0;
                      if (listing.pricing.monthlyRent && listing.pricing.monthlyRent > 0) {
                        monthlyPrice = listing.pricing.monthlyRent;
                      } else if (listing.pricing.yearlyRent && listing.pricing.yearlyRent > 0) {
                        monthlyPrice = Math.round(listing.pricing.yearlyRent / 12);
                      }
                      
                      const perRoom = listing.details.bedrooms ? Math.round(monthlyPrice / listing.details.bedrooms) : monthlyPrice;
                      return formatPrice(perRoom, listing.pricing.currency);
                    })()}
                  </span>
                  <span className="text-white/70 text-xl">/ Room monthly</span>
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-400" />
                <span className="font-medium text-white/90">{listing.details.bedrooms} Bedrooms</span>
              </div>
              <div className="flex items-center">
                <Bath className="w-5 h-5 mr-2 text-blue-400" />
                <span className="font-medium text-white/90">{listing.details.bathrooms} Bathrooms</span>
              </div>
              {listing.details.squareFootage && (
                <div className="flex items-center">
                  <Gauge className="w-5 h-5 mr-2 text-blue-400" />
                  <span className="font-medium text-white/90">{listing.details.squareFootage} sq ft</span>
                </div>
              )}
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-400" />
                <span className="font-medium text-white/90">{listing.availability.minimumStay} months min.</span>
              </div>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-2 mb-4 -ml-4 pl-4">
              {listing.details.furnished && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Home className="w-3 h-3 mr-1" />
                  Furnished
                </Badge>
              )}
              {listing.details.petFriendly && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <PawPrint className="w-3 h-3 mr-1" />
                  Pet Friendly
                </Badge>
              )}
              {listing.details.smokingAllowed && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  <Cigarette className="w-3 h-3 mr-1" />
                  Smoking OK
                </Badge>
              )}
            </div>

            {/* Pricing Details */}
            <div className="border-t border-white/20 pt-4">
              <h3 className="font-semibold mb-2 text-white/90">Pricing Details</h3>
              <div className="pricing-details-grid text-base text-white/90">
                {/* Show monthly rent only if not null and greater than 0 */}
                {listing.pricing.monthlyRent !== null && listing.pricing.monthlyRent !== undefined && listing.pricing.monthlyRent > 0 && (
                  <div className="flex flex-col">
                    <span className="text-white/70 text-sm">Monthly Rent:</span>
                    <span className="font-medium text-white/100">{formatPrice(listing.pricing.monthlyRent, listing.pricing.currency)}</span>
                  </div>
                )}
                
                {/* Show yearly rent only if not null and greater than 0 */}
                {listing.pricing.yearlyRent !== null && listing.pricing.yearlyRent !== undefined && listing.pricing.yearlyRent > 0 && (
                  <div className="col-span-2-sm">
                    <div className="flex flex-col">
                      <span className="text-white/70 text-sm">Yearly Rent:</span>
                      <div className="flex items-baseline gap-2">
                        <span className="font-medium text-blue-400">{formatPrice(listing.pricing.yearlyRent, listing.pricing.currency)}</span>
                        <span className="text-sm text-white/70">(equivalent monthly = {formatPrice(Math.round(listing.pricing.yearlyRent / 12), listing.pricing.currency)})</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Deposit and Utilities in same column */}
                <div className="space-y-3">
                  {/* Always show deposit, even if 0 */}
                  <div className="flex flex-col">
                    <span className="text-white/70 text-sm">Deposit:</span>
                    <span className="font-medium text-white/100">{formatPrice(listing.pricing.deposit, listing.pricing.currency)}</span>
                  </div>
                  
                  {/* Show utilities - display "Covered" when 0, hide when null */}
                  {listing.pricing.utilities !== null && listing.pricing.utilities !== undefined && (
                    <div className="flex flex-col">
                      <span className="text-white/70 text-sm">Utilities:</span>
                      <span className="font-medium text-white/100">
                        {listing.pricing.utilities === 0 
                          ? 'Covered' 
                          : formatPrice(listing.pricing.utilities, listing.pricing.currency)}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col">
                  <span className="text-white/70 text-sm">Available From:</span>
                  <span className="font-medium text-white/100">{formatNoYear(listing.availability.availableFrom)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Initiator Profile Card */}
        {listing.initiator && (
          <InitiatorProfileCard 
            initiator={listing.initiator} 
            className="mb-6"
            isAcceptedCandidate={isAcceptedCandidate}
            isOwner={isOwner}
          />
        )}

        {/* Amenities - Currently not available in listing data */}

        {/* Action Buttons */}
        <div className="mt-6 pb-6">
          {isOwner ? (
            // Owner controls
            <div className="flex gap-3 max-w-4xl mx-auto">
              {listing.status === 'active' && (
                <>
                  <Button 
                    onClick={handleCancel}
                    disabled={isOperating}
                    className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-white border-red-500/20 font-semibold py-2 px-4 rounded-2xl"
                    size="lg"
                  >
                    {isOperating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-0.5 animate-spin" />
                        Canceling...
                      </>
                    ) : (
                      <>
                        <X className="w-5 h-5 mr-0.5" />
                        Cancel
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={handleFinalize}
                    disabled={isOperating}
                    className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-white border-green-500/20 font-semibold py-2 px-4 rounded-2xl"
                    size="lg"
                  >
                    {isOperating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-0.5 animate-spin" />
                        Finalizing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5 mr-0.5" />
                        Finalize
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={() => navigate(`/listings/${listing.listingId}/edit`, { state: { from: location.pathname } })}
                    className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-white border-blue-500/20 font-semibold py-2 px-4 rounded-2xl"
                    size="lg"
                  >
                    <Edit className="w-5 h-5 mr-0.5" />
                    Edit
                  </Button>
                </>
              )}
              {listing.status === 'closed' && (
                <div className="w-full text-center py-3">
                  <Badge className="bg-green-100 text-green-800 text-base px-3 py-1">
                    已完成组队
                  </Badge>
                </div>
              )}
              {listing.status === 'paused' && (
                <div className="w-full text-center py-3">
                  <Badge className="bg-gray-100 text-gray-800 text-base px-3 py-1">
                    已取消
                  </Badge>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Application Modal */}
      <ApplicationModal
        open={showApplicationModal}
        onClose={() => setShowApplicationModal(false)}
        onSubmit={submitApplication}
        listingTitle={listing.title}
      />

      {/* Sticky Apply Button for Regular Users */}
      {!isOwner && (
        <div className="fixed bottom-20 left-0 right-0 z-40 px-8 pb-4 bg-gradient-to-t from-black/60 to-transparent pt-8">
          <div className="max-w-4xl mx-auto">
            <Button 
              onClick={handleApply}
              className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-white border-blue-500/20 font-semibold py-3 rounded-2xl disabled:bg-gray-500/10 disabled:text-white/50 disabled:border-gray-500/10 backdrop-blur-sm"
              size="lg"
              disabled={listing.status !== 'active'}
            >
              {listing.status === 'active' ? (
                <>
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Apply for This Property
                </>
              ) : (
                <span>
                  {listing.status === 'closed' ? 'Listing Closed' : 'Listing Unavailable'}
                </span>
              )}
            </Button>
          </div>
        </div>
      )}
    </ColoredPageWrapper>
  );
};

export default ListingDetailPage; 