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
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import ApplicationCard from './ApplicationCard';

interface MyListingCardProps {
  listing: MyListing;
  onCardClick?: (listingId: string) => void;
}

const MyListingCard: React.FC<MyListingCardProps> = ({ listing, onCardClick }) => {
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

  // Fetch applications when accordion opens
  const handleAccordionChange = (value: string) => {
    const isOpening = value === listingId;
    setIsAccordionOpen(isOpening);
    
    if (isOpening) {
      // Enable the query when accordion opens
      queryClient.invalidateQueries({ queryKey: ['listing-applications', listingId] });
    }
  };

  const applications = applicationsData?.data?.applications || [];

  const handleFinalize = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
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
    <Accordion type="single" collapsible onValueChange={handleAccordionChange}>
      <AccordionItem value={listingId} className="border-white/10 rounded-xl">
        {/* Main Card UI (The Trigger) */}
        <AccordionTrigger className="hover:no-underline p-0 [&>svg]:hidden">
          <Card className="w-full hover:shadow-lg transition-shadow duration-200 border-0 bg-black/40 backdrop-blur-sm text-white/90">
            <CardContent className="p-4">
              {/* 卡片采用上下布局：图片信息左右排列 + 按钮区独占底部 */}
              <article 
                className="w-full flex flex-col cursor-pointer" 
                data-testid="listing-card"
                onClick={() => onCardClick?.(listing.listingId)}
              >
                {/* 上半部：左右布局（图片 + 信息） */}
                <div className="flex flex-row gap-2 w-full">
                  {/* 左侧：图片区域 (50%宽度) */}
                  <div className="w-1/2 relative">
                  {mainPhoto ? (
                    <img
                      src={mainPhoto}
                      alt={title}
                        className="w-full h-auto aspect-square object-cover rounded-lg"
                    />
                  ) : (
                      <div className="w-full h-auto aspect-square flex items-center justify-center bg-black/20 rounded-lg">
                      <div className="text-sm text-white/40 text-center px-2">
                        No Image
                      </div>
                    </div>
                  )}
                  
                  {/* X/Y Filled Badge - positioned at top-left */}
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="bg-teal-500/80 backdrop-blur-sm text-white text-xs">
                      {filledSlots}/{totalSlots} Filled
                    </Badge>
                  </div>
                </div>

                  {/* 右侧：信息区域 (50%宽度，左边距) */}
                  <div className="w-1/2 flex flex-col gap-2 text-left pl-2">
                    {/* 标题左对齐 */}
                    <h3 className="text-lg font-bold text-white text-left">{title}</h3>

                    {/* 位置区域 */}
                    <div className="flex items-center text-white/70">
                    <MapPin className="h-3 w-3 mr-2 text-red-400" />
                      <span className="text-sm">{getLocationDisplay()}</span>
                  </div>

                    {/* 每房间价格 */}
                    <div className="flex items-center">
                    <span className="text-lg font-bold text-green-400">
                        {(() => {
                          const perRoom = pricePerRoom(pricing.monthlyRent, details.bedrooms);
                          return perRoom 
                            ? formatPrice(perRoom, pricing.currency)
                            : 'N/A';
                        })()}
                    </span>
                      <span className="text-sm text-white/70 ml-1">/room</span>
                  </div>

                    {/* 卧室和浴室 */}
                    <div className="flex items-center gap-2 text-white/70 text-sm">
                      <Bed className="h-3 w-3" />
                      <span>{details.bedrooms}</span>
                      <span>Beds</span>
                      <Bath className="h-3 w-3 ml-2" />
                      <span className="ml-1">{details.bathrooms}</span>
                      <span>Baths</span>
                  </div>

                    {/* 发布日期 - 不显示年份 */}
                    <div className="flex items-center text-white/70">
                    <Calendar className="h-3 w-3 mr-2 text-red-400" />
                      <span className="text-sm">Listed {formatNoYear(listing.createdAt)}</span>
                  </div>

                    {/* 可用日期 - 不显示年份 */}
                    <div className="flex items-center text-white/70">
                      <Calendar className="h-3 w-3 mr-2 text-blue-400" />
                      <span className="text-sm">Available {formatNoYear(availability.availableFrom)}</span>
                  </div>
                </div>
              </div>

                {/* 下半部：操作按钮独占整行 - 24px垂直间距 */}
                {status === 'active' && (
                  <div className="flex w-full gap-2 mt-6" data-testid="action-buttons">
                    {/* Cancel Button */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancel(e);
                      }}
                      className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/50 text-xs px-2 py-1 h-7 rounded-md cursor-pointer flex items-center justify-center transition-colors"
                    >
                      {isCancelling ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </>
                      )}
                    </div>
                    
                    {/* Edit Button */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        
                        try {
                          // 保存当前listing到localStorage缓存
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
                          
                          console.log('缓存listing数据成功，准备导航到编辑页面');
                          
                          // 使用React Router的navigate
                          navigate(`/listings/${listingId}/edit`);
                          
                        } catch (error) {
                          console.error('导航到编辑页面失败:', error);
                          toast.error('无法打开编辑页面', {
                            description: '请稍后重试'
                          });
                        }
                      }}
                      className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-600/50 text-xs px-2 py-1 h-7 rounded-md cursor-pointer flex items-center justify-center transition-colors"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </div>
                    
                    {/* Finalize Button */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFinalize(e);
                      }}
                      className={`flex-1 ${
                        filledSlots < totalSlots
                          ? 'bg-gray-600/20 text-gray-500 border-gray-600/50 cursor-not-allowed'
                          : 'bg-green-600/20 hover:bg-green-600/30 text-green-400 border-green-600/50 cursor-pointer'
                      } border text-xs px-2 py-1 h-7 rounded-md flex items-center justify-center transition-colors`}
                    >
                      {isFinalizing ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Finalize
                        </>
                      )}
                  </div>
                </div>
              )}
              </article>
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