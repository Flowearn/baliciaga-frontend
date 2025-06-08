import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Calendar, 
  Bed, 
  Bath, 
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  FileText
} from "lucide-react";
import { MyApplication } from '@/services/applicationService';

interface ApplicationCardProps {
  application: MyApplication;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({ application }) => {
  const navigate = useNavigate();

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Pending',
          variant: 'secondary' as const,
          icon: <Clock className="w-3 h-3 mr-1" />,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      case 'accepted':
        return {
          label: 'Accepted',
          variant: 'default' as const,
          icon: <CheckCircle className="w-3 h-3 mr-1" />,
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'rejected':
        return {
          label: 'Rejected',
          variant: 'destructive' as const,
          icon: <XCircle className="w-3 h-3 mr-1" />,
          className: 'bg-red-100 text-red-800 border-red-200'
        };
      case 'signed':
        return {
          label: 'Signed',
          variant: 'default' as const,
          icon: <FileText className="w-3 h-3 mr-1" />,
          className: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      default:
        return {
          label: status,
          variant: 'secondary' as const,
          icon: null,
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  const statusConfig = getStatusConfig(application.status);

  const handleViewListing = () => {
    navigate(`/listings/${application.listingId}`);
  };

  return (
    <Card className="mb-4 hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Property Image */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-gray-200">
              {application.listing.photos && application.listing.photos.length > 0 ? (
                <img
                  src={application.listing.photos[0]}
                  alt={application.listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Bed className="w-6 h-6" />
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate pr-2">
                {application.listing.title}
              </h3>
              <Badge 
                variant={statusConfig.variant}
                className={`flex items-center text-xs font-medium ${statusConfig.className} flex-shrink-0`}
              >
                {statusConfig.icon}
                {statusConfig.label}
              </Badge>
            </div>

            <div className="flex items-center text-gray-600 mb-2 text-sm">
              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="truncate">{application.listing.address}</span>
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-4 text-xs text-gray-600">
                <div className="flex items-center">
                  <Bed className="w-3 h-3 mr-1" />
                  <span>{application.listing.bedrooms}bd</span>
                </div>
                <div className="flex items-center">
                  <Bath className="w-3 h-3 mr-1" />
                  <span>{application.listing.bathrooms}ba</span>
                </div>
              </div>
              
              <div className="flex items-center font-semibold text-green-600 text-sm">
                <DollarSign className="w-4 h-4" />
                <span>
                  {formatPrice(application.listing.monthlyRent, application.listing.currency)}/mo
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs text-gray-500">
                <Calendar className="w-3 h-3 mr-1" />
                <span>Applied {formatDate(application.createdAt)}</span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewListing}
                className="text-xs"
              >
                View Listing
              </Button>
            </div>
          </div>
        </div>

        {/* Application Message Preview */}
        {application.message && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-600 line-clamp-2">
              <span className="font-medium">Your message: </span>
              {application.message}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApplicationCard; 