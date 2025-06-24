import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MyListing } from '@/services/listingService';
import { 
  fetchApplicationsForListing, 
  updateApplicationStatus,
  ReceivedApplication 
} from '@/services/applicationService';
import { finalizeListing, cancelListing } from '@/services/listingService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
// 移除Accordion imports - 使用新的独立按钮机制
import { formatPrice, cn } from '@/lib/utils';
import { formatNoYear } from '@/utils/formatDate';
import { pricePerRoom } from '@/utils/pricePerRoom';
import { 
  Bed, 
  Bath, 
  MapPin, 
  Calendar, 
  Edit, 
  X,
  Loader2,
  CheckCircle2,
  ChevronDown,
  XCircle,
  CheckCircle,
  Banknote
} from 'lucide-react';
import { toast } from 'sonner';
import ApplicationCard from './ApplicationCard';
import { useAuth } from '@/context/AuthContext';

interface MyListingCardProps {
  listing: MyListing;
  onCardClick?: (listingId: string) => void;
}

const MyListingCard: React.FC<MyListingCardProps> = ({ listing, onCardClick }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isApplicantsVisible, setIsApplicantsVisible] = useState(false);
  
  const {
    listingId,
    title,
    pricing,
    details,
    location,
    photos,
    status,
    applicationsCount,
    availability
  } = listing;

  const { user: authUser } = useAuth();
  const isOwner = authUser?.userId === listing.initiatorId;

  // Get applications for this listing when accordion is opened
  const { data: applicationsData, isLoading: isLoadingApplications, error: applicationsError } = useQuery({
    queryKey: ['listing-applications', listingId],
    queryFn: () => fetchApplicationsForListing(listingId, { limit: 50 }),
    enabled: isApplicantsVisible, // 只在申请人列表可见时加载数据
    refetchOnWindowFocus: false
  });

  // 添加诊断日志
  useEffect(() => {
    if (applicationsData) {
      console.log(`[DIAGNOSIS] Successfully fetched data for listing ${listingId}:`, applicationsData);
    }
  }, [applicationsData, listingId]);

  useEffect(() => {
    if (applicationsError) {
      console.error(`[DIAGNOSIS] Error fetching applications for listing ${listingId}:`, applicationsError);
    }
  }, [applicationsError, listingId]);

  // Get the first photo or use a placeholder
  const mainPhoto = photos && photos.length > 0 ? photos[0] : null;

  // 获取位置信息：从address中提取区域或显示完整地址
  const getLocationDisplay = () => {
    // 首先检查是否有locationArea字段（扩展支持）
    const extendedListing = listing as { locationArea?: string; city?: string };
    if (extendedListing.locationArea && extendedListing.locationArea.trim()) {
      return extendedListing.locationArea.trim();
    }
    
    // 检查是否有city字段（扩展支持）
    if (extendedListing.city && extendedListing.city.trim()) {
      return extendedListing.city.trim();
    }
    
    // 从address中智能提取区域信息
    const parts = location.address.split(',').map(part => part.trim());
    
    // 尝试识别区域名称（通常是非数字的部分，排除邮编）
    for (let i = parts.length - 1; i >= 0; i--) {
      const part = parts[i];
      // 跳过纯数字（邮编）和国家名
      if (!/^\d+$/.test(part) && part.toLowerCase() !== 'indonesia' && part.toLowerCase() !== 'bali') {
        // 如果包含常见区域名称，优先返回
        if (/canggu|ubud|seminyak|kuta|sanur|denpasar|jimbaran|nusa dua/i.test(part)) {
          return part;
        }
        // 否则返回第一个非数字非国家的部分
        if (part.length > 2) {
          return part;
        }
      }
    }
    
    // 兜底：返回地址的最后一个非数字部分或完整地址
    const lastNonNumericPart = parts.find(part => !/^\d+$/.test(part));
    return lastNonNumericPart || location.address;
  };

  // Calculate filled slots: 1 (initiator) + accepted applications
  const calculateFilledSlots = () => {
    const acceptedCount = applicationsData?.data?.applications?.filter(
      (app: ReceivedApplication) => app.status === 'accepted'
    ).length || 0;
    return 1 + acceptedCount; // 1 for initiator + accepted applications
  };

  // Calculate total slots available
  const totalSlots = listing.details.bedrooms || 1;
  const filledSlots = calculateFilledSlots();

  // 移除旧的accordion处理函数，现在使用独立的按钮控制

  const applications = applicationsData?.data?.applications || [];

  const handleFinalize = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!listing.listingId) {
      toast.error('Cannot finalize: Listing ID is missing.');
      return;
    }
    
    if (filledSlots < totalSlots) {
      toast.error('Cannot finalize listing', {
        description: `This listing still has ${totalSlots - filledSlots} unfilled spot(s).`
      });
      return;
    }

    try {
      setIsFinalizing(true);
      const response = await finalizeListing(listingId);
      
      if (response.success) {
        toast.success('Listing Finalized Successfully!', {
          description: `${response.data?.updatedApplicationsCount || 0} applications updated to signed status.`
        });
        
        // Refresh the listings
        queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      } else {
        throw new Error(response.error?.message || 'Failed to finalize listing');
      }
    } catch (error: unknown) {
      console.error('Finalize listing error:', error);
      
      const axiosError = error as { response?: { status: number } };
      const errorWithMessage = error as { message?: string };
      
      if (axiosError.response?.status === 403) {
        toast.error('Permission Denied', {
          description: 'Only the listing owner can finalize this listing.'
        });
      } else if (axiosError.response?.status === 404) {
        toast.error('Listing Not Found', {
          description: 'The listing you are trying to finalize was not found.'
        });
      } else {
        toast.error('Finalize Failed', {
          description: errorWithMessage.message || 'An error occurred while finalizing the listing.'
        });
      }
    } finally {
      setIsFinalizing(false);
    }
  };

  const handleCancel = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!listing.listingId) {
      toast.error('Cannot cancel: Listing ID is missing.');
      return;
    }
    
    try {
      setIsCancelling(true);
      const response = await cancelListing(listingId);
      
      if (response.success) {
        toast.success('Listing Cancelled Successfully!', {
          description: 'The listing has been cancelled and is no longer visible to others.'
        });
        
        // Refresh the listings
        queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      } else {
        throw new Error(response.error?.message || 'Failed to cancel listing');
      }
    } catch (error: unknown) {
      console.error('Cancel listing error:', error);
      
      const axiosError = error as { response?: { status: number } };
      const errorWithMessage = error as { message?: string };
      
      if (axiosError.response?.status === 403) {
        toast.error('Permission Denied', {
          description: 'Only the listing owner can cancel this listing.'
        });
      } else if (axiosError.response?.status === 404) {
        toast.error('Listing Not Found', {
          description: 'The listing you are trying to cancel was not found.'
        });
      } else {
        toast.error('Cancel Failed', {
          description: errorWithMessage.message || 'An error occurred while cancelling the listing.'
      });
      }
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="w-full mb-2">
      <Card className="bg-black/40 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-200">
        <CardContent className="p-4 sm:p-6">
          {/* Property Image - Full width, clickable */}
          <div 
            className="w-full aspect-video rounded-lg overflow-hidden bg-gray-200 cursor-pointer relative mb-4"
            onClick={() => onCardClick?.(listing.listingId)}
          >
            {mainPhoto ? (
              <OptimizedImage 
                src={mainPhoto} 
                alt={title}
                aspectRatio="4:3"
                priority={false}
              />
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-gray-500" />
              </div>
            )}
            
            {/* Status Badges - positioned at top-right */}
            <div className="absolute top-5 right-5 z-[2] flex gap-2">
              {/* Filled Badge */}
              <span className="px-3 py-0.5 rounded-full text-sm font-semibold text-white shadow-md shadow-black/20 bg-teal-500/80">
                {filledSlots}/{totalSlots} Filled
              </span>
              
              {/* Cancelled/Filled Status Badge */}
              {status === 'cancelled' && (
                <span className="px-3 py-0.5 rounded-full text-sm font-semibold text-white shadow-md shadow-black/20 bg-red-500/80">
                  Cancelled
                </span>
              )}
              {status === 'filled' && (
                <span className="px-3 py-0.5 rounded-full text-sm font-semibold text-white shadow-md shadow-black/20 bg-green-500/80">
                  Filled
                </span>
              )}
            </div>
          </div>

          {/* Listing Details */}
          <div>
            {/* Header */}
            <div className="mb-3">
              <h3 
                className="font-semibold text-white/100 text-base truncate cursor-pointer hover:text-blue-400 transition-colors"
                onClick={() => onCardClick?.(listing.listingId)}
              >
                {title}
              </h3>
              {/* Location */}
              <div className="flex items-center text-base text-white/80 mt-1">
                <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                <span className="truncate">
                  {getLocationDisplay()}
                </span>
              </div>
            </div>

            {/* Price - Full Width */}
            <div className="flex items-center text-base text-white/100 mb-3">
              <Banknote className="w-4 h-4 mr-2 text-green-400" />
              <div className="flex items-baseline gap-1">
                {(() => {
                  // Calculate monthly price (convert yearly to monthly if needed)
                  let monthlyPrice = 0;
                  if (pricing.monthlyRent && pricing.monthlyRent > 0) {
                    monthlyPrice = pricing.monthlyRent;
                  } else if (pricing.yearlyRent && pricing.yearlyRent > 0) {
                    monthlyPrice = Math.round(pricing.yearlyRent / 12);
                  }
                  
                  if (monthlyPrice > 0) {
                    const perRoom = details.bedrooms ? Math.round(monthlyPrice / details.bedrooms) : monthlyPrice;
                    return (
                      <>
                        <span className="text-xl">{formatPrice(perRoom, pricing.currency)}</span>
                        <span className="text-white/60 text-sm">/ Room monthly</span>
                      </>
                    );
                  }
                  return <span className="text-white/60 text-sm">Price N/A</span>;
                })()}
              </div>
            </div>

            {/* Property Details - 2 Column Grid */}
            <div className="grid grid-cols-2 gap-3 mb-3 text-base">
              {/* Left Column */}
              <div>
                {/* Beds/Baths - First row */}
                <div className="flex items-center text-white/100">
                  <Bed className="w-4 h-4 mr-2 text-blue-400" />
                  <span>{details.bedrooms} bed{details.bedrooms !== 1 ? 's' : ''} {details.bathrooms} bath{details.bathrooms !== 1 ? 's' : ''}</span>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-2">
                {/* Listed Date */}
                <div className="flex items-center text-sm text-white/60">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>Listed on {formatNoYear(listing.createdAt)}</span>
                </div>
                {/* Available Date */}
                <div className="flex items-center text-sm text-white/60">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>Available from {formatNoYear(availability.availableFrom)}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Action Buttons - Always visible at bottom for active listings owned by user */}
          {status === 'active' && isOwner && (
            <div className="flex gap-2 mt-4 pt-4 border-t border-white/20">
              {/* Cancel Button */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    disabled={isCancelling}
                    className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-white border-red-500/20 rounded-full"
                  >
                    {isCancelling ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-0.5 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 mr-0.5" />
                        Cancel
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently cancel your listing and all associated applications.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Go Back</AlertDialogCancel>
                    <AlertDialogAction onClick={(e) => handleCancel(e)}>Yes, Cancel Listing</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {/* Finalize Button - Always visible */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    disabled={isFinalizing || filledSlots < totalSlots}
                    className={`flex-1 rounded-full ${
                      filledSlots < totalSlots 
                        ? 'bg-gray-500/10 text-gray-400 border-gray-500/10 cursor-not-allowed' 
                        : 'bg-green-500/20 hover:bg-green-500/30 text-white border-green-500/20'
                    }`}
                  >
                    {isFinalizing ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-0.5 animate-spin" />
                        Finalizing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3 h-3 mr-0.5" />
                        Finalize
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Finalize Listing?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action is final and will close the listing to new applications. All accepted applicants will be notified. Are you sure you want to proceed?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={(e) => handleFinalize(e)}>Confirm & Finalize</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {/* Edit Button */}
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  
                  try {
                    // Save current listing to localStorage cache
                    const cachedListings = localStorage.getItem('my-listings-cache') || '[]';
                    let existingListings: MyListing[] = [];
                    
                    try {
                      existingListings = JSON.parse(cachedListings);
                    } catch {
                      existingListings = [];
                    }
                    
                    const updatedListings = existingListings.filter((l: MyListing) => l.listingId !== listing.listingId);
                    updatedListings.push(listing);
                    localStorage.setItem('my-listings-cache', JSON.stringify(updatedListings));
                    
                    console.log('Cached listing data successfully, navigating to edit page');
                    
                    // Use React Router navigate with 'from' state
                    navigate(`/listings/${listingId}/edit`, { state: { from: '/my-listings' } });
                    
                  } catch (error) {
                    console.error('Failed to navigate to edit page:', error);
                    toast.error('Unable to open edit page', {
                      description: 'Please try again later'
                    });
                  }
                }}
                className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-white border-blue-500/20 rounded-full"
              >
                <Edit className="w-3 h-3 mr-0.5" />
                Edit
              </Button>
            </div>
          )}

          {/* Applications Toggle Button */}
          <div
            className="mt-4 flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 cursor-pointer rounded-md border border-white/20"
            onClick={(e) => {
              e.stopPropagation();
              setIsApplicantsVisible(!isApplicantsVisible);
            }}
          >
            <span className="font-semibold text-base text-white/100">Applications</span>
            <ChevronDown
              className={`w-5 h-5 text-white/60 transform transition-transform duration-200 ${
                isApplicantsVisible ? 'rotate-180' : ''
              }`}
            />
          </div>

          {/* Applications List (Conditionally Rendered) */}
          {isApplicantsVisible && (
            <div className="mt-4">
              {isLoadingApplications ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2 text-white/60" />
                  <span className="text-base text-white/80">Loading applications...</span>
                </div>
              ) : applicationsError ? (
                <div className="py-8 text-center text-red-400">
                  <p>Error loading applications</p>
                </div>
              ) : applications.length === 0 ? (
                <div className="py-8 text-center text-white/60">
                  <p>No applications found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {applications.map((application: ReceivedApplication) => (
                    <ApplicationCard 
                      key={application.applicationId} 
                      application={application} 
                      listingId={listingId}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyListingCard;