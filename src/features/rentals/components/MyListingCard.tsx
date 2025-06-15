import React, { useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { formatPrice } from '@/utils/currencyUtils';
import { 
  Bed, 
  Bath, 
  MapPin, 
  Calendar, 
  Edit, 
  X,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import ApplicationCard from './ApplicationCard';

interface MyListingCardProps {
  listing: MyListing;
}

const MyListingCard: React.FC<MyListingCardProps> = ({ listing }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  
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

  // Get applications for this listing when accordion is opened
  const { data: applicationsData, isLoading: isLoadingApplications, error: applicationsError } = useQuery({
    queryKey: ['listing-applications', listingId],
    queryFn: () => fetchApplicationsForListing(listingId, { limit: 50 }),
    enabled: false, // Will be enabled when accordion opens
    refetchOnWindowFocus: false
  });

  // Get the first photo or use a placeholder
  const mainPhoto = photos && photos.length > 0 ? photos[0] : null;

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate filled slots: 1 (initiator) + accepted applications
  const calculateFilledSlots = () => {
    const acceptedCount = applicationsData?.data?.applications?.filter(
      (app: ReceivedApplication) => app.status === 'accepted'
    ).length || 0;
    return 1 + acceptedCount; // 1 for initiator + accepted applications
  };

  // Handle finalize listing
  const handleFinalize = async () => {
    try {
      setIsFinalizing(true);
      
      const response = await finalizeListing(listingId);
      
      if (response.success) {
        toast.success('组队成功！', {
          description: `已成功完成组队，${response.data?.updatedApplicationsCount || 0} 个申请已更新为已签约状态。`
        });
        
        queryClient.invalidateQueries({ queryKey: ['my-listings'] });
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
      setIsFinalizing(false);
    }
  };

  // Handle cancel listing
  const handleCancel = async () => {
    try {
      setIsCancelling(true);
      
      const response = await cancelListing(listingId);
      
      if (response.success) {
        toast.success('招租信息已取消', {
          description: '您的招租信息已成功取消。'
        });
        
        queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      } else {
        throw new Error(response.error?.message || '取消招租失败');
      }
    } catch (error: unknown) {
      console.error('Cancel listing error:', error);
      
      const errorWithMessage = error as { message?: string };
      toast.error('取消招租失败', {
        description: errorWithMessage.message || '发生未知错误，请重试。'
      });
    } finally {
      setIsCancelling(false);
    }
  };

  // Handle accordion value change to enable/disable query
  const handleAccordionChange = (value: string) => {
    const isOpening = value === listingId;
    setIsAccordionOpen(isOpening);
    
    if (isOpening) {
      // Accordion is opening, enable the query
      queryClient.prefetchQuery({
        queryKey: ['listing-applications', listingId],
        queryFn: () => fetchApplicationsForListing(listingId, { limit: 50 }),
      });
    }
  };

  const applications = applicationsData?.data?.applications || [];
  const totalSlots = details.bedrooms || 4;
  const filledSlots = calculateFilledSlots();

  return (
    <Accordion type="single" collapsible onValueChange={handleAccordionChange}>
      <AccordionItem value={listingId} className="border-white/10 rounded-xl">
        {/* Main Card UI (The Trigger) */}
        <AccordionTrigger className="hover:no-underline p-0 [&>svg]:hidden">
          <Card className="w-full hover:shadow-lg transition-shadow duration-200 border-0 bg-black/40 backdrop-blur-sm text-white/90">
            <CardContent className="p-4">
              {/* Edit Button - positioned above two-column layout */}
              <div className="flex justify-end mb-3">
                <div 
                  className="px-3 py-1 border border-white/20 rounded-md text-xs text-white/70 hover:bg-white/10 cursor-pointer flex items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edits
                </div>
              </div>

              {/* Two-Column Layout */}
              <div className="flex">
                {/* Left Column - Image (33%) */}
                <div className="relative w-1/3">
                  {mainPhoto ? (
                    <img
                      src={mainPhoto}
                      alt={title}
                      className="aspect-square w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="aspect-square w-full h-full flex items-center justify-center bg-black/20 rounded-lg">
                      <div className="text-sm text-white/40 text-center px-2">
                        No Image
                      </div>
                    </div>
                  )}
                  
                  {/* X/Y Filled Badge - positioned at top-left */}
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="bg-teal-500/80 backdrop-blur-sm text-white">
                      {filledSlots}/{totalSlots} Filled
                    </Badge>
                  </div>
                </div>

                {/* Right Column - Information (67%) */}
                <div className="w-2/3 pl-4 flex flex-col">
                  {/* First Row - Title only */}
                  <div className="mb-2">
                    <h3 className="text-lg font-bold text-white">{title}</h3>
                  </div>

                  {/* Second Row - Location Area (Extract area from address) */}
                  <div className="flex items-center text-white/70 mb-2">
                    <MapPin className="h-3 w-3 mr-2 text-red-400" />
                    <span className="text-sm">{location.address.split(',').pop()?.trim() || location.address}</span>
                  </div>

                  {/* Third Row - Monthly Rent */}
                  <div className="flex items-center mb-2">
                    <span className="text-lg font-bold text-green-400">
                      {formatPrice(pricing.monthlyRent, pricing.currency)}
                    </span>
                    <span className="text-sm text-white/70 ml-1">/month</span>
                  </div>

                  {/* Fourth Row - Bedrooms and Bathrooms */}
                  <div className="flex items-center text-white/70 mb-2">
                    <Bed className="h-3 w-3 mr-2" />
                    <span className="text-sm mr-6">{details.bedrooms} Bed{details.bedrooms !== 1 ? 's' : ''}</span>
                    <Bath className="h-3 w-3 mr-2" />
                    <span className="text-sm">{details.bathrooms} Bath{details.bathrooms !== 1 ? 's' : ''}</span>
                  </div>

                  {/* Fifth Row - Listed Date */}
                  <div className="flex items-center text-white/70 mb-2">
                    <Calendar className="h-3 w-3 mr-2 text-red-400" />
                    <span className="text-sm">Listed {formatDate(listing.createdAt)}</span>
                  </div>

                  {/* Sixth Row - Available Date */}
                  <div className="flex items-center text-white/70 mb-4">
                    <Calendar className="h-3 w-3 mr-2 text-red-400" />
                    <span className="text-sm">Available {formatDate(availability.availableFrom)}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Action Buttons */}
              <div className="flex space-x-3 mt-4">
                {(status === 'active' || status === 'open') && (
                  <>
                    <div 
                      className="flex-1 px-3 py-2 border border-red-400/50 text-red-400 hover:bg-red-400/10 rounded-full text-xs font-medium cursor-pointer flex items-center justify-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancel();
                      }}
                    >
                      {isCancelling ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                          取消中...
                        </>
                      ) : (
                        <>
                          <X className="h-3 w-3 mr-2" />
                          Cancel
                        </>
                      )}
                    </div>
                    
                    <div 
                      className="flex-1 px-3 py-2 bg-teal-500/80 hover:bg-teal-500 text-white rounded-full text-xs font-medium cursor-pointer flex items-center justify-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFinalize();
                      }}
                    >
                      {isFinalizing ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                          完成中...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3 w-3 mr-2" />
                          Finalize
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Applications Toggle Text with Custom Chevron */}
              {applicationsCount > 0 && (
                <div className="border-t border-white/10 mt-4 pt-4">
                  <div className="flex items-center">
                    <span className="font-medium text-sm text-white">Applications</span>
                    <svg 
                      className={`h-4 w-4 shrink-0 transition-transform duration-200 ml-2 text-white/70 ${isAccordionOpen ? 'rotate-180' : ''}`}
                      xmlns="http://www.w3.org/2000/svg" 
                      width="24" 
                      height="24" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </AccordionTrigger>
        
        {/* Applications List (The Content) */}
        <AccordionContent>
          <div className="bg-black/20 backdrop-blur-sm rounded-b-xl">
            {isLoadingApplications ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2 text-white/70" />
                <span className="text-sm text-white/70">Loading applications...</span>
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
              <div>
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
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default MyListingCard; 