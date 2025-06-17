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
  DollarSign,
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
  X
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from '@/context/AuthContext';
import ColoredPageWrapper from '@/components/layout/ColoredPageWrapper';

import { fetchListingById, incrementView, finalizeListing, cancelListing } from '@/services/listingService';
import { createApplication } from '@/services/applicationService';
import ApplicationModal from '@/features/applications/components/ApplicationModal';
import { Listing } from '@/types';
import { formatPrice } from '@/utils/currencyUtils';
import { pricePerRoom } from '@/utils/pricePerRoom';

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

  const isOwner = authUser?.sub && listing?.initiatorId === authUser.sub;

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
        <div className="sticky top-0 z-50 bg-black/40 backdrop-blur-sm py-3 px-4 border-b border-white/10">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="mr-3 p-2 hover:bg-white/20 rounded-full"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </Button>
            <Skeleton className="h-6 w-48 bg-white/20" />
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
              onClick={() => navigate(-1)}
              className="mr-3 p-2 hover:bg-white/20 rounded-full"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </Button>
            <h1 className="text-white font-semibold text-xl">Listing Not Found</h1>
          </div>
        </div>
        <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
          <div className="bg-black/40 backdrop-blur-sm rounded-2xl flex flex-col items-center p-8 text-white/80">
            <AlertCircle className="h-12 w-12 stroke-red-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-white">Something went wrong</h3>
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
      <div className="sticky top-0 z-50 bg-black/40 backdrop-blur-sm py-3 px-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="mr-3 p-2 hover:bg-white/20 rounded-full"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </Button>
            <h1 className="text-white font-semibold text-xl truncate">{listing.title}</h1>
          </div>
          {isMyListing && (
            <Link 
              to="/my-listings" 
              className="text-sm text-blue-400 hover:text-blue-300 hover:underline"
            >
              ← Back to My Listings
            </Link>
          )}
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6 max-w-4xl">
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
        <Card className="mb-6 bg-white/90 backdrop-blur-sm shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{listing.title}</h1>
                <div className="flex items-center text-gray-600 mb-3">
                  <MapPin className="w-3 h-3 mr-2" />
                  <span className="text-xs">{listing.location.address}</span>
                </div>
              </div>
              <div className="text-left">
                {/* Price per Room – 同行左对齐 */}
                <div className="flex items-baseline gap-1 justify-start">
                  <span className="text-green-600 font-bold text-3xl">
                    {(() => {
                      const perRoom = pricePerRoom(listing.pricing.monthlyRent, listing.details.bedrooms);
                      return formatPrice(perRoom, listing.pricing.currency);
                    })()} {listing.pricing.currency}
                  </span>
                  <span className="text-gray-500 text-lg">/ Room monthly</span>
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                <span className="font-medium">{listing.details.bedrooms} 卧室</span>
              </div>
              <div className="flex items-center">
                <Bath className="w-5 h-5 mr-2 text-blue-600" />
                <span className="font-medium">{listing.details.bathrooms} 浴室</span>
              </div>
              {listing.details.squareFootage && (
                <div className="flex items-center">
                  <Gauge className="w-5 h-5 mr-2 text-blue-600" />
                  <span className="font-medium">{listing.details.squareFootage} sq ft</span>
                </div>
              )}
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                <span className="font-medium">{listing.availability.minimumStay} months min.</span>
              </div>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-2 mb-4">
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
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Pricing Details</h3>
              <div className="flex flex-col gap-1 text-sm">
                <div className="flex justify-between">
                  <span>Monthly Rent:</span>
                  <span className="font-medium">{formatPrice(listing.pricing.monthlyRent, listing.pricing.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Deposit:</span>
                  <span className="font-medium">{formatPrice(listing.pricing.deposit, listing.pricing.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Utilities:</span>
                  <span className="font-medium">{formatPrice(listing.pricing.utilities, listing.pricing.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Available From:</span>
                  <span className="font-medium">{formatDate(listing.availability.availableFrom)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card className="mb-6 bg-white/90 backdrop-blur-sm shadow-lg">
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-3">Description</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {listing.description}
            </p>
          </CardContent>
        </Card>

        {/* Amenities - Currently not available in listing data */}

        {/* Action Buttons */}
        <div className="sticky bottom-4 z-40">
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-2">
            <CardContent className="p-4">
              {isOwner ? (
                // Owner controls
                <div className="flex gap-3">
                  {listing.status === 'active' && (
                    <>
                      <Button 
                        onClick={handleFinalize}
                        disabled={isOperating}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg"
                        size="lg"
                      >
                        {isOperating ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            完成中...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-5 h-5 mr-2" />
                            完成组队
                          </>
                        )}
                      </Button>
                      <Button 
                        onClick={handleCancel}
                        disabled={isOperating}
                        variant="destructive"
                        className="flex-1 font-semibold py-3 rounded-lg"
                        size="lg"
                      >
                        {isOperating ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            取消中...
                          </>
                        ) : (
                          <>
                            <X className="w-5 h-5 mr-2" />
                            取消房源
                          </>
                        )}
                      </Button>
                    </>
                  )}
                  {listing.status === 'closed' && (
                    <div className="w-full text-center py-3">
                      <Badge className="bg-green-100 text-green-800 text-sm px-3 py-1">
                        已完成组队
                      </Badge>
                    </div>
                  )}
                  {listing.status === 'paused' && (
                    <div className="w-full text-center py-3">
                      <Badge className="bg-gray-100 text-gray-800 text-sm px-3 py-1">
                        已取消
                      </Badge>
                    </div>
                  )}
                </div>
              ) : (
                // Regular user apply button
                <Button 
                  onClick={handleApply}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
                  size="lg"
                  disabled={listing.status !== 'active'}
                >
                  {listing.status === 'active' ? (
                    <>
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Apply for This Property
                    </>
                  ) : (
                    <span className="text-gray-400">
                      {listing.status === 'closed' ? 'Listing Closed' : 'Listing Unavailable'}
                    </span>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Application Modal */}
      <ApplicationModal
        open={showApplicationModal}
        onClose={() => setShowApplicationModal(false)}
        onSubmit={submitApplication}
        listingTitle={listing.title}
      />
    </ColoredPageWrapper>
  );
};

export default ListingDetailPage; 