import React, { useState, useEffect, useCallback } from 'react';
import { useThemeStore } from '@/stores/useThemeStore';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
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
  Edit,
  Share2,
  Phone
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from '@/context/AuthContext';
import ColoredPageWrapper from '@/components/layout/ColoredPageWrapper';

import { fetchListingById, incrementView, finalizeListing, cancelListing } from '@/services/listingService';
import { createApplication, fetchMyApplications } from '@/services/applicationService';
import ApplicationModal from '@/features/applications/components/ApplicationModal';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import InitiatorProfileCard from '@/features/rentals/components/InitiatorProfileCard';
import { Listing } from '@/types';
import { formatPrice } from '@/lib/utils';
import { pricePerRoom } from '@/utils/pricePerRoom';
import { formatNoYear } from '@/utils/formatDate';
import { getLocationDisplay } from '@/utils/locationUtils';

// Helper function to detect if a string is a phone number and format WhatsApp link
const formatContactLink = (contact: string): { isPhone: boolean; whatsappLink?: string; displayText: string } => {
  // Remove spaces and check if it looks like a phone number
  const cleanedContact = contact.replace(/\s/g, '');
  
  // Pattern to match international phone numbers (starting with + followed by digits, dashes, parentheses)
  const phonePattern = /^\+?[\d\-\(\)]+$/;
  const isPhone = phonePattern.test(cleanedContact) && cleanedContact.length >= 10;
  
  if (isPhone) {
    // Remove all non-digit characters except the leading +
    const digitsOnly = cleanedContact.replace(/[^\d+]/g, '');
    // Remove + if present and ensure we have just digits for WhatsApp
    const whatsappNumber = digitsOnly.startsWith('+') ? digitsOnly.substring(1) : digitsOnly;
    
    return {
      isPhone: true,
      whatsappLink: `https://wa.me/${whatsappNumber}`,
      displayText: contact
    };
  }
  
  return {
    isPhone: false,
    displayText: contact
  };
};

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
  
  // Get theme store function for setting header color
  const setImmersiveTheme = useThemeStore((state) => state.setImmersiveTheme);
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOperating, setIsOperating] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [isAcceptedCandidate, setIsAcceptedCandidate] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showFinalizeDialog, setShowFinalizeDialog] = useState(false);

  // Carousel setup with autoplay
  const autoplayOptions = { delay: 3000, stopOnInteraction: false };
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true }, 
    [Autoplay(autoplayOptions)]
  );
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Handle slide changes
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentSlide(emblaApi.selectedScrollSnap());
  }, [emblaApi]);
  
  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    onSelect();
    
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  // 判断当前登录用户是否为房源发起人：比较内部业务主键 userId
  const isOwner = authUser?.userId && listing?.initiatorId === authUser.userId;

  // Manage header color lifecycle for immersive header effect
  useEffect(() => {
    // 定义此页面的主题色 (我们暂时使用一个深灰色作为测试)
    const pageThemeColor = '#FFFFFF'; 

    // 组件加载时，设置页头颜色
    setImmersiveTheme({
      backgroundColor: pageThemeColor,
      foregroundColor: '#FFFFFF'
    });

    // **关键一步**: 返回一个清理函数，在组件卸载时执行
    return () => {
      // 离开页面时，恢复页头为默认颜色
      setImmersiveTheme(null);
    };
  }, [setImmersiveTheme]); // 依赖项数组

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

  const submitApplication = async (message: string, applicantLeaseDuration?: string) => {
    if (!listing || !authUser) return;

    try {
      await createApplication(listing.listingId, message, applicantLeaseDuration);
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
        toast.success('Listing finalized successfully!', {
          description: `${response.data?.updatedApplicationsCount || 0} application(s) have been updated to finalized status.`
        });
        
        // 更新本地状态
        setListing(prev => prev ? { ...prev, status: 'finalized' as const } : null);
      } else {
        throw new Error(response.error?.message || 'Failed to finalize listing');
      }
    } catch (error: unknown) {
      console.error('Finalize listing error:', error);
      
      const axiosError = error as { response?: { status: number } };
      const errorWithMessage = error as { message?: string };
      
      if (axiosError.response?.status === 403) {
        toast.error('Permission denied', {
          description: 'Only the listing owner can finalize this listing.'
        });
      } else if (axiosError.response?.status === 404) {
        toast.error('Listing not found', {
          description: 'The specified listing could not be found.'
        });
      } else {
        toast.error('Failed to finalize listing', {
          description: errorWithMessage.message || 'Operation failed, please try again later.'
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
        toast.success('Listing cancelled successfully!');
        
        // 更新本地状态
        setListing(prev => prev ? { ...prev, status: 'cancelled' as const } : null);
      } else {
        throw new Error(response.error?.message || 'Failed to cancel listing');
      }
    } catch (error: unknown) {
      console.error('Cancel listing error:', error);
      
      const axiosError = error as { response?: { status: number } };
      const errorWithMessage = error as { message?: string };
      
      if (axiosError.response?.status === 403) {
        toast.error('Permission denied', {
          description: 'Only the listing owner can cancel this listing.'
        });
      } else if (axiosError.response?.status === 404) {
        toast.error('Listing not found', {
          description: 'The specified listing could not be found.'
        });
      } else {
        toast.error('Failed to cancel listing', {
          description: errorWithMessage.message || 'Operation failed, please try again later.'
        });
      }
    } finally {
      setIsOperating(false);
    }
  };

  // Helper function to copy link to clipboard
  async function copyLinkToClipboard(urlToCopy: string) {
    try {
      await navigator.clipboard.writeText(urlToCopy);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy link using navigator.clipboard: ', err);
      // Final fallback if navigator.clipboard.writeText also fails
      alert('Failed to copy link automatically. Please copy manually from address bar.');
    }
  }

  // Handle Share button click
  const handleShareClick = async () => {
    const shareUrl = window.location.href; // URL of the current listing detail page
    const listingTitle = listing?.title || 'Listing'; // Use actual listing title if available
    const shareTitle = `Baliciaga: ${listingTitle}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          url: shareUrl,
        });
        console.log('Content shared successfully via Web Share API');
      } catch (error) {
        console.error('Error using Web Share API:', error);
        
        // Check if user cancelled the share action
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('Share cancelled by user.');
          return; // Don't show fallback if user explicitly cancelled
        }
        
        // Only fall back to clipboard copy for actual errors
        await copyLinkToClipboard(shareUrl);
      }
    } else {
      // Fallback if Web Share API is not supported
      console.log('Web Share API not supported, falling back to clipboard copy.');
      await copyLinkToClipboard(shareUrl);
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
        {/* Sticky Header - Consistent with CafeDetail */}
        <div className="sticky top-0 z-50" style={{ height: 'calc(16px + 1.5rem)' }}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 py-3 px-4">
            <Button 
              variant="ghost" 
              size="icon" 
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
              className="p-0 h-auto w-auto bg-transparent hover:bg-transparent"
            >
              <ArrowLeft className="h-5 w-5 text-white/90" />
            </Button>
          </div>
        </div>
        <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl" style={{ marginTop: '16px' }}>
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
        <div className="sticky top-0 z-50" style={{ height: 'calc(16px + 1.5rem)' }}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 py-3 px-4">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
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
                className="p-0 h-auto w-auto bg-transparent hover:bg-transparent"
              >
                <ArrowLeft className="h-5 w-5 text-white/90" />
              </Button>
            </div>
          </div>
        </div>
        <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl" style={{ marginTop: '16px' }}>
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
    <ColoredPageWrapper seed={listingId || 'listing'} className="min-h-screen">
      {/* Sticky Header - Consistent with CafeDetail */}
      <div className="sticky top-0 z-50" style={{ height: 'calc(16px + 1.5rem)' }}>
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 py-3 px-4">
          <Button 
            variant="ghost" 
            size="icon" 
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
            className="p-0 h-auto w-auto bg-transparent hover:bg-transparent"
          >
            <ArrowLeft className="h-5 w-5 text-white/90" />
          </Button>
        </div>
      </div>

              <div className="relative z-10 container mx-auto px-4 pt-0 pb-24 max-w-4xl flex flex-col gap-y-4" style={{ marginTop: '16px' }}>
        {/* Main Photo Gallery with Carousel */}
        {listing.photos && listing.photos.length > 0 && (
          <div className="embla relative rounded-xl overflow-hidden shadow-lg">
            <div className="embla__viewport aspect-square" ref={emblaRef}>
              <div className="embla__container flex h-full">
                {listing.photos.map((photoUrl, index) => (
                  <div className="embla__slide flex-[0_0_100%] min-w-0 relative" key={index}>
                    <OptimizedImage
                      src={photoUrl}
                      alt={`${listing.title} - Photo ${index + 1}`}
                      aspectRatio="1:1"
                      priority={index === 0}
                      className="h-full"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Slide indicators */}
            {listing.photos.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-10">
                {listing.photos.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentSlide 
                        ? 'bg-white w-6' 
                        : 'bg-white/50 hover:bg-white/70'
                    }`}
                    onClick={() => emblaApi?.scrollTo(index)}
                  />
                ))}
              </div>
            )}
            
            {/* Status Badge - copied from ListingCard */}
            <span
              className={`absolute top-5 right-5 z-[2] rounded-full px-3 py-0.5 text-sm font-semibold shadow-md shadow-black/20 ${
                (() => {
                  // 1. 从已接受的申请人数量开始计算
                  let filled = listing.acceptedApplicantsCount ?? 0;
                  
                  // 2. 检查发起人的角色，如果是'tenant'，则名额+1
                  if (listing.initiator?.role === 'tenant') {
                    filled++;
                  }
                  
                  // 3. 计算总名额
                  const total = listing.totalSpots ?? listing.details.bedrooms ?? 1;
                  
                  switch (listing.status) {
                    case 'active':
                      return 'bg-green-500/80 text-white';
                    case 'finalized':
                      return 'bg-gray-600/80 text-white';
                    case 'cancelled':
                    default:
                      return 'bg-rose-500/80 text-white';
                  }
                })()
              }`}
            >
              {(() => {
                const filled = listing.acceptedApplicantsCount ?? 0;
                const total = listing.totalSpots ?? listing.details.bedrooms ?? 1;
                
                switch (listing.status) {
                  case 'active':
                    return `${filled}/${total} Filled`;
                  case 'finalized':
                    return 'Finalized';
                  case 'cancelled':
                  default:
                    return 'Cancelled';
                }
              })()}
            </span>
            
            {/* Lease Duration Badge */}
            {listing.availability?.leaseDuration && listing.availability.leaseDuration !== '' && (
              <span className="absolute top-5 left-5 z-[2] rounded-full bg-black/60 px-3 py-0.5 text-sm font-semibold text-white shadow-md shadow-black/20">
                {listing.availability.leaseDuration}
              </span>
            )}
          </div>
        )}

        {/* Basic Info Card */}
        <Card className="bg-black/40 backdrop-blur-sm shadow-lg border-none">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h1 className="text-2xl font-bold text-white/90 flex-1 pr-2">{listing.title}</h1>
                  <Button 
                    className="bg-white text-[#0a0a0a] hover:bg-gray-100 rounded-full px-3 h-8 text-sm font-normal flex items-center justify-center gap-x-1.5"
                    onClick={handleShareClick}
                  >
                    <Share2 size={16} />
                    Share
                  </Button>
                </div>
                <div className="flex items-center text-white/90 mb-3">
                  <MapPin className="w-3 h-3 mr-2" />
                  <span className="text-sm">{getLocationDisplay(listing.location)}</span>
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
                {(() => {
                  // Create array of all possible pricing details in order
                  const allPricingItems = [
                    {
                      label: "Monthly Rent:",
                      value: listing.pricing.monthlyRent !== null && listing.pricing.monthlyRent !== undefined && listing.pricing.monthlyRent > 0 
                        ? formatPrice(listing.pricing.monthlyRent, listing.pricing.currency) 
                        : null
                    },
                    {
                      label: "Yearly Rent:",
                      value: listing.pricing.yearlyRent !== null && listing.pricing.yearlyRent !== undefined && listing.pricing.yearlyRent > 0 
                        ? (
                          <div>
                            <div className="font-medium text-blue-400">{formatPrice(listing.pricing.yearlyRent, listing.pricing.currency)}</div>
                            <div className="text-sm text-white/70">(monthly = {formatPrice(Math.round(listing.pricing.yearlyRent / 12), listing.pricing.currency)})</div>
                          </div>
                        )
                        : null
                    },
                    {
                      label: "Deposit:",
                      value: formatPrice(listing.pricing.deposit, listing.pricing.currency) // Always show deposit, even if 0
                    },
                    {
                      label: "Utilities:",
                      value: listing.pricing.utilities !== null && listing.pricing.utilities !== undefined
                        ? (listing.pricing.utilities === 0 ? 'Covered' : formatPrice(listing.pricing.utilities, listing.pricing.currency))
                        : null
                    },
                    {
                      label: "Available From:",
                      value: formatNoYear(listing.availability.availableFrom)
                    },
                    {
                      label: "Lease Term:",
                      value: listing.availability.leaseDuration && listing.availability.leaseDuration !== '' 
                        ? listing.availability.leaseDuration 
                        : null
                    }
                  ];

                  // Filter out items with null/undefined values and render sequentially
                  return allPricingItems
                    .filter(item => item.value !== null && item.value !== undefined)
                    .map((item, index) => (
                      <div key={index} className="flex flex-col">
                        <span className="text-white/70 text-sm">{item.label}</span>
                        <span className="font-medium text-white/100">
                          {item.value}
                        </span>
                      </div>
                    ));
                })()}
              </div>
            </div>

            {/* Property Contact Section */}
            {listing.propertyContact && (
              <div className="border-t border-white/20 pt-4 mt-4">
                <h3 className="font-semibold mb-2 text-white/90">Property Contact</h3>
                <div className="flex items-center gap-2">
                  {(() => {
                    const contactInfo = formatContactLink(listing.propertyContact);
                    
                    if (contactInfo.isPhone && contactInfo.whatsappLink) {
                      return (
                        <a
                          href={contactInfo.whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                          <span className="font-medium">{contactInfo.displayText}</span>
                          <svg
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.982-3.585c-.637-1.085-.995-2.337-.995-3.665 0-3.812 3.104-6.915 6.916-6.915 3.812 0 6.916 3.104 6.916 6.915s-3.104 6.915-6.916 6.915z"/>
                          </svg>
                        </a>
                      );
                    } else {
                      return (
                        <span className="text-white/90 font-medium">
                          {contactInfo.displayText}
                        </span>
                      );
                    }
                  })()}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Initiator Profile Card */}
        {listing.initiator && (
          <InitiatorProfileCard 
            initiator={listing.initiator} 
            className=""
            isAcceptedCandidate={isAcceptedCandidate}
            isOwner={isOwner}
          />
        )}

        {/* Apply Button for Non-owners when listing is finalized - placed 16px below initiator */}
        {!isOwner && listing.status !== 'active' && (
          <div className="mt-4">
            <Button 
              onClick={handleApply}
              className="w-full bg-gray-500/10 text-white/50 border-gray-500/10 font-semibold py-3 rounded-2xl cursor-not-allowed"
              size="lg"
              disabled={true}
            >
              <span>
                {listing.status === 'finalized' ? 'Listing Finalized' : 'Listing Unavailable'}
              </span>
            </Button>
          </div>
        )}

        {/* Amenities - Currently not available in listing data */}

        {/* Action Buttons */}
        <div className="pb-6">
          {isOwner ? (
            // Owner controls
            <div className="flex gap-3 max-w-4xl mx-auto">
              {listing.status === 'active' && (
                <>
                  <Button 
                    onClick={() => setShowCancelDialog(true)}
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
                    onClick={() => setShowFinalizeDialog(true)}
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
              {listing.status === 'finalized' && (
                <div className="w-full text-center py-3">
                  <Badge className="bg-green-100 text-green-800 text-base px-3 py-1">
                    Finalized
                  </Badge>
                </div>
              )}
              {listing.status === 'cancelled' && (
                <div className="w-full text-center py-3">
                  <Badge className="bg-gray-100 text-gray-800 text-base px-3 py-1">
                    Cancelled
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
        leaseDuration={listing.availability?.leaseDuration}
      />

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="w-[calc(100vw-40px)] max-w-md bg-black/40 backdrop-blur-sm rounded-xl border-white/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white">
              Cancel Listing?
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-white/80">
              Are you sure you want to cancel this listing? This action cannot be undone and will remove your listing from public view.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              onClick={() => setShowCancelDialog(false)}
              disabled={isOperating}
              className="bg-white/20 hover:bg-white/30 text-white border-white/20 rounded-full"
            >
              No, keep it
            </Button>
            <Button 
              onClick={() => {
                setShowCancelDialog(false);
                handleCancel();
              }}
              disabled={isOperating}
              className="bg-red-500/20 hover:bg-red-500/30 text-white border-red-500/20 rounded-full"
            >
              Yes, cancel listing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Finalize Confirmation Dialog */}
      <Dialog open={showFinalizeDialog} onOpenChange={setShowFinalizeDialog}>
        <DialogContent className="w-[calc(100vw-40px)] max-w-md bg-black/40 backdrop-blur-sm rounded-xl border-white/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white">
              Finalize Listing?
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-white/80">
              Are you sure you want to finalize this listing? This will:
            </p>
            <ul className="mt-2 space-y-1 text-white/70 list-disc list-inside">
              <li>Close the listing to new applications</li>
              <li>Mark all accepted applications as finalized</li>
              <li>Notify all accepted candidates</li>
            </ul>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              onClick={() => setShowFinalizeDialog(false)}
              disabled={isOperating}
              className="bg-white/20 hover:bg-white/30 text-white border-white/20 rounded-full"
            >
              Not yet
            </Button>
            <Button 
              onClick={() => {
                setShowFinalizeDialog(false);
                handleFinalize();
              }}
              disabled={isOperating}
              className="bg-green-500/20 hover:bg-green-500/30 text-white border-green-500/20 rounded-full"
            >
              Yes, finalize listing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sticky Apply Button for Regular Users - Only show when listing is active */}
      {!isOwner && listing.status === 'active' && (
        <div className="sticky bottom-[56px] z-10 p-4">
          <div className="max-w-4xl mx-auto px-4">
            <Button 
              onClick={handleApply}
              className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-white border-blue-500/20 font-semibold py-3 rounded-2xl backdrop-blur-sm"
              size="lg"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Apply for This Property
            </Button>
          </div>
        </div>
      )}
    </ColoredPageWrapper>
  );
};

export default ListingDetailPage; 