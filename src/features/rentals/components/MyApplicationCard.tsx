import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { 
  MapPin,
  Calendar,
  Banknote,
  Users,
  MessageSquare,
  Trash2,
  Loader2,
  Bed,
  ChevronDown
} from 'lucide-react';
import { MyApplication, cancelApplication } from '@/services/applicationService';
import { formatPrice } from '@/lib/utils';
import { formatNoYear, formatDate } from '@/utils/formatDate';
import { toast } from 'sonner';

interface MyApplicationCardProps {
  application: MyApplication;
  onApplicationCanceled?: (applicationId: string) => void;
}

const MyApplicationCard: React.FC<MyApplicationCardProps> = ({ 
  application, 
  onApplicationCanceled 
}) => {
  const navigate = useNavigate();
  const [isCancelling, setIsCancelling] = useState(false);
  const [isRoommatesVisible, setIsRoommatesVisible] = useState(false);

  // Calculate monthly price per room (convert yearly to monthly if needed)
  let monthlyPrice = 0;
  if (application.listing.pricing.monthlyRent && application.listing.pricing.monthlyRent > 0) {
    monthlyPrice = application.listing.pricing.monthlyRent;
  } else if (application.listing.pricing.yearlyRent && application.listing.pricing.yearlyRent > 0) {
    monthlyPrice = Math.round(application.listing.pricing.yearlyRent / 12);
  }
  
  const pricePerRoom = application.listing.details.bedrooms && monthlyPrice > 0
    ? Math.round(monthlyPrice / application.listing.details.bedrooms) 
    : monthlyPrice;

  // Get status badge color - using 80% transparent color backgrounds with white text
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/80 text-white';
      case 'accepted':
        return 'bg-green-500/80 text-white';
      case 'rejected':
        return 'bg-red-500/80 text-white';
      case 'signed':
        return 'bg-blue-500/80 text-white';
      default:
        return 'bg-gray-500/80 text-white';
    }
  };

  // Get status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Rejected';
      case 'signed':
        return 'Signed';
      default:
        return status;
    }
  };

  // Handle application cancellation
  const handleCancelApplication = async () => {
    if (!confirm('Are you sure you want to cancel this application? This action cannot be undone.')) {
      return;
    }

    setIsCancelling(true);
    try {
      const response = await cancelApplication(application.applicationId);
      
      if (response.success) {
        toast.success('Application cancelled successfully');
        onApplicationCanceled?.(application.applicationId);
      } else {
        toast.error(response.error?.message || 'Failed to cancel application');
      }
    } catch (error) {
      console.error('Error canceling application:', error);
      toast.error('Failed to cancel application, please try again');
    } finally {
      setIsCancelling(false);
    }
  };

  // Check if application can be cancelled
  const canCancel = application.status === 'pending';

  // Handle listing click
  const handleListingClick = () => {
    navigate(`/listings/${application.listingId}`, { state: { from: '/my-applications' } });
  };

  return (
    <div className="mb-4">
    <Card className="bg-black/40 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-200">
      <CardContent className="p-4 sm:p-6">
        {/* Property Image - Full width, clickable */}
        <div 
          className="w-full aspect-video rounded-lg overflow-hidden bg-gray-200 cursor-pointer mb-4 relative"
          onClick={handleListingClick}
        >
          {application.listing.photos?.[0] ? (
            <OptimizedImage 
              src={application.listing.photos[0]} 
              alt={application.listing.title}
              aspectRatio="4:3"
              priority={false}
            />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-gray-500" />
            </div>
          )}
          
          {/* Status Badge - positioned at top-right */}
          <span className={`absolute top-5 right-5 z-[2] px-3 py-0.5 rounded-full text-sm font-semibold text-white shadow-md shadow-black/20 ${getStatusColor(application.status)}`}>
            {getStatusLabel(application.status)}
          </span>
        </div>

        {/* Application Details */}
        <div>
          {/* Header */}
          <div className="mb-3">
            <h3 
              className="font-semibold text-white/100 text-base truncate cursor-pointer hover:text-blue-400 transition-colors"
              onClick={handleListingClick}
            >
              {application.listing.title}
            </h3>
            {/* Location */}
            <div className="flex items-center text-base text-white/80 mt-1">
              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="truncate">
                {application.listing.location.address}
              </span>
            </div>
          </div>

          {/* Price Row with Cancel Button */}
          <div className="flex items-end justify-between mb-3">
            <div className="flex items-center text-base text-white/100">
              <Banknote className="w-4 h-4 mr-2 text-green-400" />
              <div className="flex items-baseline gap-1">
                {monthlyPrice > 0 ? (
                  <>
                    <span className="text-xl">{formatPrice(pricePerRoom, application.listing.pricing.currency)}</span>
                    <span className="text-white/60 text-sm">/ Room monthly</span>
                  </>
                ) : (
                  <span className="text-white/60 text-sm">Price N/A</span>
                )}
              </div>
            </div>
            
            {/* Cancel Button */}
            {canCancel && (
              <Button
                size="sm"
                onClick={handleCancelApplication}
                disabled={isCancelling}
                className="bg-red-500/20 hover:bg-red-500/30 text-white border-red-500/20 rounded-full"
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-0.5 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3 h-3 mr-0.5" />
                    Cancel
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Property Details - 2 Column Grid */}
          <div className="grid grid-cols-2 gap-3 mb-3 text-base">
            {/* Left Column */}
            <div>
              {/* Beds/Baths - First row */}
              <div className="flex items-center text-white/100">
                <Bed className="w-4 h-4 mr-2 text-blue-400" />
                <span>{application.listing.details.bedrooms} bed{application.listing.details.bedrooms !== 1 ? 's' : ''} {application.listing.details.bathrooms} bath{application.listing.details.bathrooms !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-2">
              {/* Applied Date */}
              <div className="flex items-center text-sm text-white/60">
                <Calendar className="w-3 h-3 mr-1" />
                <span>Applied on {formatNoYear(application.createdAt)}</span>
              </div>
              {/* Available Date */}
              <div className="flex items-center text-sm text-white/60">
                <Calendar className="w-3 h-3 mr-1" />
                <span>Available from {formatNoYear(application.listing.availability.availableFrom)}</span>
              </div>
            </div>
          </div>

          {/* Application Message */}
          {application.message && (
            <div className="mb-3">
              <div className="flex items-start">
                <MessageSquare className="w-4 h-4 mr-2 mt-0.5 text-white/60 flex-shrink-0" />
                <p className="text-base text-white/80 break-words">
                  {application.message}
                </p>
              </div>
            </div>
          )}



          {/* Accepted Roommates Toggle Button */}
          {application.acceptedRoommates && application.acceptedRoommates.length > 0 && (
            <div
              className="mt-4 flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 cursor-pointer rounded-md border border-white/20"
              onClick={(e) => {
                e.stopPropagation();
                setIsRoommatesVisible(!isRoommatesVisible);
              }}
            >
              <span className="font-semibold text-base text-white/100">
                Accepted Candidates ({application.acceptedRoommates.length})
              </span>
              <ChevronDown
                className={`w-5 h-5 text-white/60 transform transition-transform duration-200 ${
                  isRoommatesVisible ? 'rotate-180' : ''
                }`}
              />
            </div>
          )}

          {/* Accepted Roommates List (Conditionally Rendered) */}
          {isRoommatesVisible && application.acceptedRoommates && application.acceptedRoommates.length > 0 && (
            <div className="mt-4 space-y-3">
              {application.acceptedRoommates.map((roommate, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-white/10 rounded-lg">
                  <div className="flex-1 pr-2">
                    <div className="font-medium text-white/100 whitespace-nowrap overflow-hidden text-ellipsis">
                      {roommate.profile.name || roommate.email}
                    </div>
                    
                    {/* Age and Gender in same row */}
                    {(roommate.profile.age || roommate.profile.gender) && (
                      <div className="text-base text-white/80 mt-1 whitespace-nowrap">
                        {[
                          roommate.profile.age && `${roommate.profile.age} years old`,
                          roommate.profile.gender && roommate.profile.gender.charAt(0).toUpperCase() + roommate.profile.gender.slice(1)
                        ].filter(Boolean).join(' • ')}
                      </div>
                    )}
                    
                    {/* Nationality */}
                    {roommate.profile.nationality && (
                      <div className="text-base text-white/80 whitespace-nowrap">
                        {roommate.profile.nationality}
                      </div>
                    )}
                    
                    {/* Occupation */}
                    {roommate.profile.occupation && (
                      <div className="text-base text-white/80 mt-1 whitespace-nowrap overflow-hidden text-ellipsis">
                        {roommate.profile.occupation}
                      </div>
                    )}
                    
                    {/* Languages */}
                    {roommate.profile.languages && roommate.profile.languages.length > 0 && (
                      <div className="text-base text-white/80 mt-1">
                        {roommate.profile.languages.join(', ')}
                      </div>
                    )}
                  </div>
                  
                  <div className="w-24 h-24 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {roommate.profile.profilePictureUrl ? (
                      <OptimizedImage 
                        src={roommate.profile.profilePictureUrl} 
                        alt={roommate.profile.name || roommate.email}
                        aspectRatio="1:1"
                        priority={false}
                      />
                    ) : (
                      <Users className="w-12 h-12 text-white/80" />
                    )}
                  </div>
                </div>
              ))}
              
              {/* Privacy notice */}
              <div className="text-sm text-white/60 text-center mt-4">
                Only accepted candidates can see this
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  </div>
  );
};

export default MyApplicationCard;