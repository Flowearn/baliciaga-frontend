import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  MapPin,
  Calendar,
  DollarSign,
  Users,
  MessageSquare,
  Trash2,
  Loader2
} from 'lucide-react';
import { MyApplication, cancelApplication } from '@/services/applicationService';
import { formatPrice } from '@/utils/currencyUtils';
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
  const [isCancelling, setIsCancelling] = useState(false);

  // Calculate price per room
  const pricePerRoom = application.listing.details.bedrooms 
    ? Math.round(application.listing.pricing.monthlyRent / application.listing.details.bedrooms) 
    : application.listing.pricing.monthlyRent;

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'signed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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

  return (
    <Card className="mb-4 bg-white/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-200">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Left: Property Image */}
          <div className="w-full sm:w-32 aspect-video rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
            {application.listing.photos?.[0] ? (
              <img 
                src={application.listing.photos[0]} 
                alt={application.listing.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-gray-500" />
              </div>
            )}
          </div>

          {/* Right: Application Details */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-lg truncate">
                  {application.listing.title}
                </h3>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="truncate">
                    {application.listing.location.address}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2 sm:mt-0">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(application.status)}`}>
                  {getStatusLabel(application.status)}
                </span>
              </div>
            </div>

            {/* Property Details */}
            <div className="grid grid-cols-2 gap-3 text-sm text-gray-700 mb-3">
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                <div className="flex items-baseline gap-1">
                  <span>{formatPrice(pricePerRoom, application.listing.pricing.currency)}</span>
                  <span className="text-gray-500 text-xs">/ Room</span>
                </div>
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2 text-blue-600" />
                <span>{application.listing.details.bedrooms} bed{application.listing.details.bedrooms !== 1 ? 's' : ''} {application.listing.details.bathrooms} bath{application.listing.details.bathrooms !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* Application Message */}
            {application.message && (
              <div className="mb-3">
                <div className="flex items-start">
                  <MessageSquare className="w-4 h-4 mr-2 mt-0.5 text-gray-500 flex-shrink-0" />
                  <p className="text-sm text-gray-700 break-words">
                    {application.message}
                  </p>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>Applied on {formatNoYear(application.createdAt)}</span>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>Available from {formatDate(application.listing.availability.availableFrom)}</span>
                </div>
              </div>
              
              {canCancel && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelApplication}
                  disabled={isCancelling}
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                >
                  {isCancelling ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Cancel
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Accepted Roommates (if applicable) */}
            {application.acceptedRoommates && application.acceptedRoommates.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Accepted Roommates</h4>
                <div className="space-y-1">
                  {application.acceptedRoommates.map((roommate, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      <span className="font-medium">{roommate.profile.name || roommate.email}</span>
                      {roommate.profile.age && <span className="ml-2">({roommate.profile.age} years old)</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MyApplicationCard; 