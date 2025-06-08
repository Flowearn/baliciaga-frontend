import React from 'react';
import { MyListing } from '@/services/listingService';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bed, 
  Bath, 
  MapPin, 
  Calendar, 
  Users, 
  Eye, 
  Edit, 
  Settings 
} from 'lucide-react';

interface MyListingCardProps {
  listing: MyListing;
}

const MyListingCard: React.FC<MyListingCardProps> = ({ listing }) => {
  const {
    listingId,
    title,
    pricing,
    details,
    location,
    photos,
    status,
    applicationsCount,
    viewsCount,
    availability
  } = listing;

  // Get the first photo or use a placeholder
  const mainPhoto = photos && photos.length > 0 ? photos[0] : null;

  // Format the monthly rent with currency
  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'expired':
        return 'destructive';
      case 'rented':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold truncate">{title}</h3>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="truncate">{location.address}</span>
            </div>
          </div>
          <Badge variant={getStatusVariant(status)}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <div className="flex gap-4">
          {/* Property Image */}
          <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
            {mainPhoto ? (
              <img
                src={mainPhoto}
                alt={title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <div className="text-xs text-gray-400 text-center px-2">
                  No Image
                </div>
              </div>
            )}
          </div>

          {/* Property Details */}
          <div className="flex-1 space-y-3">
            {/* Price */}
            <div>
              <span className="text-2xl font-bold text-primary">
                {formatPrice(pricing.monthlyRent, pricing.currency)}
              </span>
              <span className="text-sm text-muted-foreground ml-1">/month</span>
            </div>

            {/* Property specs */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Bed className="h-4 w-4" />
                <span>{details.bedrooms} bed{details.bedrooms !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-1">
                <Bath className="h-4 w-4" />
                <span>{details.bathrooms} bath{details.bathrooms !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Available {formatDate(availability.availableFrom)}</span>
              </div>
            </div>

            {/* Key metrics for owner */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">
                  {applicationsCount} application{applicationsCount !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
                <Eye className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  {viewsCount} view{viewsCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-2 border-t">
        <div className="flex gap-2 w-full">
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1"
            disabled={applicationsCount === 0}
          >
            <Settings className="h-4 w-4 mr-2" />
            Manage Applications
            {applicationsCount > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {applicationsCount}
              </Badge>
            )}
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default MyListingCard; 