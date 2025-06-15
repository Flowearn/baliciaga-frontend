import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, MapPin, Calendar, Users, Home, Bed, Bath, DollarSign } from "lucide-react";
import { Listing } from '@/types';
import { formatPrice } from '@/utils/currencyUtils';

interface ListingCardProps {
  listing: Listing;
  onCardClick?: (listingId: string) => void;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing, onCardClick }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIndex((prev) => 
      prev === 0 ? listing.photos.length - 1 : prev - 1
    );
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIndex((prev) => 
      prev === listing.photos.length - 1 ? 0 : prev + 1
    );
  };

  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(listing.listingId);
    }
  };



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={handleCardClick}
    >
      {/* Photo Carousel */}
      <div className="relative h-48 sm:h-52 lg:h-48 bg-gray-100">
        {listing.photos && listing.photos.length > 0 ? (
          <>
            <img
              src={listing.photos[currentPhotoIndex]}
              alt={`${listing.title} - Photo ${currentPhotoIndex + 1}`}
              className="w-full h-full object-cover"
            />
            
            {/* Photo Navigation */}
            {listing.photos.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 rounded-full w-8 h-8 p-0"
                  onClick={handlePrevPhoto}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 rounded-full w-8 h-8 p-0"
                  onClick={handleNextPhoto}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                
                {/* Photo Dots Indicator */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {listing.photos.map((_, index) => (
                    <div
                      key={index}
                      className={`w-1.5 h-1.5 rounded-full ${
                        index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Home className="w-12 h-12" />
          </div>
        )}
      </div>

      <CardContent className="p-3 sm:p-4">
        {/* Title and Price */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 space-y-1 sm:space-y-0">
          <h3 className="font-semibold text-base sm:text-lg text-gray-900 line-clamp-2 sm:line-clamp-1 flex-1 pr-2">
            {listing.title}
          </h3>
          <div className="text-left sm:text-right flex-shrink-0">
            <div className="font-bold text-lg sm:text-xl text-green-600">
              {formatPrice(listing.pricing.monthlyRent, listing.pricing.currency)}
            </div>
            <div className="text-xs text-gray-500">per month</div>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
          <span className="text-sm line-clamp-1">{listing.location.address}</span>
        </div>

        {/* Property Details */}
        <div className="flex items-center flex-wrap gap-3 sm:gap-4 mb-3 text-sm text-gray-600">
          <div className="flex items-center">
            <Bed className="w-4 h-4 mr-1 flex-shrink-0" />
            <span>{listing.details.bedrooms} bed{listing.details.bedrooms !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center">
            <Bath className="w-4 h-4 mr-1 flex-shrink-0" />
            <span>{listing.details.bathrooms} bath{listing.details.bathrooms !== 1 ? 's' : ''}</span>
          </div>
          {listing.details.squareFootage && (
            <div className="flex items-center">
              <Home className="w-4 h-4 mr-1 flex-shrink-0" />
              <span>{listing.details.squareFootage} sqft</span>
            </div>
          )}
        </div>

        {/* Availability */}
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <Calendar className="w-4 h-4 mr-1" />
          <span>Available from {formatDate(listing.availability.availableFrom)}</span>
        </div>

        {/* Features Badges */}
        <div className="flex flex-wrap gap-1 mb-3">
          {listing.details.furnished && (
            <Badge variant="secondary" className="text-xs">Furnished</Badge>
          )}
          {listing.details.petFriendly && (
            <Badge variant="secondary" className="text-xs">Pet Friendly</Badge>
          )}
          {listing.details.smokingAllowed && (
            <Badge variant="secondary" className="text-xs">Smoking OK</Badge>
          )}
        </div>

        {/* Additional Costs */}
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex justify-between">
            <span>Deposit:</span>
            <span>{formatPrice(listing.pricing.deposit, listing.pricing.currency)}</span>
          </div>
          {listing.pricing.utilities > 0 && (
            <div className="flex justify-between">
              <span>Utilities:</span>
              <span>{formatPrice(listing.pricing.utilities, listing.pricing.currency)}/month</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ListingCard; 