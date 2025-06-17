import React from 'react';
import { Listing } from '@/types';
import { formatPrice } from '@/utils/currencyUtils';
import { formatNoYear } from '@/utils/formatDate';
import { cn } from '@/lib/utils';

interface ListingCardProps {
  listing: Listing;
  onCardClick?: (listingId: string) => void;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing, onCardClick }) => {
  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(listing.listingId);
    }
  };

  // 获取状态胶囊信息 - 对标Café卡片颜色和阴影
  const getStatusInfo = (listing: Listing) => {
    const filled = listing.acceptedApplicantsCount ?? 0;
    const total = listing.totalSpots ?? listing.details.bedrooms ?? 1;
    
    switch (listing.status) {
      case 'active':
        return { 
          label: `${filled}/${total} Filled`, 
          color: 'bg-green-500' // 匹配Café Open胶囊 #22C55E
        };
      case 'closed':
        return { 
          label: 'Finalized', 
          color: 'bg-gray-600' // 匹配Café Closed胶囊
        };
      case 'paused':
      default:
        return { 
          label: 'Cancelled', 
          color: 'bg-rose-500' // 玫红色取消状态
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

  // 计算每房间价格
  const calculatePricePerRoom = () => {
    return listing.details.bedrooms 
      ? Math.round(listing.pricing.monthlyRent / listing.details.bedrooms) 
      : listing.pricing.monthlyRent;
  };

  const perRoomPrice = calculatePricePerRoom();
  const { label, color } = getStatusInfo(listing);

  return (
    <div className="w-full cursor-pointer" onClick={handleCardClick}>
      {/* Image Container with Status Badge */}
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3">
            <img
          src={listing.photos?.[0] || '/placeholder-villa.jpg'}
          alt={listing.title}
              className="w-full h-full object-cover"
            />
            
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
        
        {/* Title Text */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white text-xl font-bold drop-shadow-md">
            {listing.title}
          </h3>
        </div>

        {/* Status Badge - 完全对标Café卡片样式和位置 */}
        <span
          className={cn(
            'absolute top-5 right-5 z-[2] rounded-full px-3 py-0.5 text-xs font-semibold text-white shadow-md shadow-black/20',
            color
          )}
        >
          {label}
        </span>
        </div>

      {/* Info Area - Two Rows */}
      <div className="space-y-1">
        {/* Row 1: Price + Location */}
        <div className="flex items-baseline justify-between px-0.5">
          <div className="flex items-baseline gap-1 whitespace-nowrap">
            <span className="text-lg font-semibold text-green-600">
              {formatPrice(listing.pricing.monthlyRent / listing.details.bedrooms)} {listing.pricing.currency}
            </span>
            <span className="text-sm text-gray-500">/ Room monthly</span>
          </div>
          <span className="text-sm text-gray-600 whitespace-nowrap">
            {getLocationDisplay()}
          </span>
        </div>

        {/* Row 2: Beds/Baths + Date */}
        <div className="flex items-baseline justify-between px-0.5 listing-info-row-2">
          <span className="text-sm text-gray-700 whitespace-nowrap">
            {listing.details.bedrooms}&nbsp;&nbsp;Bedrooms&nbsp;&nbsp;{listing.details.bathrooms}&nbsp;&nbsp;Bathrooms
          </span>
          <span className="text-sm text-gray-600 whitespace-nowrap">
            Available {formatNoYear(listing.availability.availableFrom)}
          </span>
        </div>
            </div>
        </div>
  );
};

export default ListingCard; 