import React from 'react';
import { Listing } from '@/types';
import { formatPrice } from '@/lib/utils';
import { formatNoYear } from '@/utils/formatDate';
import { cn } from '@/lib/utils';

interface ListingCardProps {
  listing: Listing;
  onCardClick?: (listingId: string) => void;
  isArchived?: boolean; // Indicates if this is a cancelled/archived listing
}

const ListingCard: React.FC<ListingCardProps> = ({ listing, onCardClick, isArchived = false }) => {
  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(listing.listingId);
    }
  };

  // 获取状态胶囊信息 - 使用80%透明底色+白色文字
  const getStatusInfo = (listing: Listing) => {
    const filled = listing.acceptedApplicantsCount ?? 0;
    const total = listing.totalSpots ?? listing.details.bedrooms ?? 1;
    
    switch (listing.status) {
      case 'active':
        return { 
          label: `${filled}/${total} Filled`, 
          color: 'bg-green-500/80 text-white'
        };
      case 'closed':
        return { 
          label: 'Finalized', 
          color: 'bg-gray-600/80 text-white'
        };
      case 'paused':
      default:
        return { 
          label: 'Cancelled', 
          color: 'bg-rose-500/80 text-white'
        };
    }
  };

  // 获取位置信息：智能提取区域信息
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
    const parts = listing.location.address.split(',').map(part => part.trim());
    
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
    return lastNonNumericPart || listing.location.address;
  };

  // 计算每房间月租价格 - 永远使用monthly作为基础
  const getMonthlyPrice = () => {
    if (listing.pricing.monthlyRent && listing.pricing.monthlyRent > 0) {
      return listing.pricing.monthlyRent;
    } else if (listing.pricing.yearlyRent && listing.pricing.yearlyRent > 0) {
      return Math.round(listing.pricing.yearlyRent / 12);
    }
    return 0;
  };
  
  const monthlyPrice = getMonthlyPrice();
  const perRoomPrice = listing.details.bedrooms && monthlyPrice > 0
    ? Math.round(monthlyPrice / listing.details.bedrooms)
    : monthlyPrice;
  
  const { label, color } = getStatusInfo(listing);

  return (
    <div className={cn(
      "w-full cursor-pointer transition-all duration-200",
      isArchived && "opacity-60 grayscale hover:opacity-80 hover:grayscale-0"
    )} onClick={handleCardClick}>
      {/* Image Container with Status Badge */}
      <div className={cn(
        "relative aspect-[4/3] rounded-xl overflow-hidden mb-2",
        isArchived && "border-2 border-dashed border-gray-400"
      )}>
            <img
          src={listing.photos?.[0] || '/placeholder-villa.jpg'}
          alt={listing.title}
              className="w-full h-full object-cover"
            />
            
        {/* 1️⃣ 基础渐变层 - 使用自定义类覆盖Amplify样式 */}
        <div className="absolute inset-0 gradient-overlay-base z-[1] pointer-events-none"></div>

        {/* 2️⃣ 标题容器渐变层 - 使用自定义类覆盖Amplify样式 */}
        <div className="absolute bottom-0 left-0 right-0 pt-4 px-4 pb-3 gradient-overlay-strong z-[2] pointer-events-none">
          <h1 className="text-2xl font-bold text-white drop-shadow-md">
            {listing.title}
          </h1>
        </div>

        {/* 4️⃣ Status Badge - 调整z-index对齐CafeCard */}
        <span
          className={cn(
            'absolute top-5 right-5 z-[2] rounded-full px-3 py-0.5 text-sm font-semibold shadow-md shadow-black/20',
            color
          )}
        >
          {label}
        </span>

        {/* 5️⃣ Archived Overlay */}
        {isArchived && (
          <div className="absolute inset-0 flex items-center justify-center z-[3] bg-black/20">
            <span className="bg-red-600/90 text-white px-3 py-1 rounded-lg font-semibold text-base shadow-lg">
              ARCHIVED
            </span>
          </div>
        )}
        </div>

      {/* Info Area - Two Rows */}
      <div className="space-y-0.5">
        {/* Row 1: Price + Location */}
        <div className="flex items-baseline justify-between px-0.5">
          <div className="flex items-baseline gap-1 whitespace-nowrap">
            {monthlyPrice > 0 ? (
              <>
                <span className="text-xl font-semibold text-green-600">
                  {formatPrice(perRoomPrice, listing.pricing.currency)}
                </span>
                <span className="text-base text-gray-500">
                  / room monthly
                </span>
              </>
            ) : (
              <span className="text-base text-gray-500">Price not available</span>
            )}
          </div>
          <span className="text-base text-gray-600 whitespace-nowrap">
            {getLocationDisplay()}
          </span>
        </div>

        {/* Row 2: Beds/Baths + Date */}
        <div className="flex items-baseline justify-between px-0.5 listing-info-row-2">
          <span className="text-base text-gray-700 whitespace-nowrap">
            {listing.details.bedrooms}&nbsp;&nbsp;Bedrooms&nbsp;&nbsp;{listing.details.bathrooms}&nbsp;&nbsp;Bathrooms
          </span>
          <span className="text-base text-gray-600 whitespace-nowrap">
            Available {formatNoYear(listing.availability.availableFrom)}
          </span>
        </div>
        
            </div>
        </div>
  );
};

export default ListingCard; 