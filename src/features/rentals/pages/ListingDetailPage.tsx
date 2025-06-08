import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Calendar, 
  Users, 
  Home, 
  Bed, 
  Bath, 
  DollarSign,
  Clock,
  AlertCircle,
  ArrowLeft,
  Heart,
  Share2,
  Wifi,
  Car,
  Utensils,
  Zap,
  Wind,
  Loader2,
  Check
} from "lucide-react";
import { toast } from "sonner";

import { Listing } from '@/types';
import { fetchListingById } from '@/services/listingService';
import { createApplication } from '@/services/applicationService';
import SimpleMap from '../components/SimpleMap';

const ListingDetailPage: React.FC = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  
  // Application modal states
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    if (!listingId) {
      setError('Invalid listing ID');
      setIsLoading(false);
      return;
    }

    const loadListing = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetchListingById(listingId);
        
        if (response.success) {
          setListing(response.data);
        } else {
          throw new Error('Failed to fetch listing details');
        }
      } catch (error) {
        console.error('Error loading listing:', error);
        const errorMessage = 'Failed to load listing details. Please try again.';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadListing();
  }, [listingId]);

  const handlePrevPhoto = () => {
    if (!listing?.photos.length) return;
    setCurrentPhotoIndex((prev) => 
      prev === 0 ? listing.photos.length - 1 : prev - 1
    );
  };

  const handleNextPhoto = () => {
    if (!listing?.photos.length) return;
    setCurrentPhotoIndex((prev) => 
      prev === listing.photos.length - 1 ? 0 : prev + 1
    );
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleApply = () => {
    if (hasApplied) {
      return; // Prevent multiple applications
    }
    setIsApplicationModalOpen(true);
  };

  const handleSubmitApplication = async () => {
    if (!listingId || !applicationMessage.trim()) {
      toast.error('Please enter a message before submitting your application.');
      return;
    }

    try {
      setIsSubmittingApplication(true);
      
      const response = await createApplication(listingId, applicationMessage.trim());
      
      if (response.success) {
        toast.success('Application sent successfully!', {
          description: 'The property owner will review your application and get back to you.'
        });
        
        // Update state to reflect successful application
        setHasApplied(true);
        setIsApplicationModalOpen(false);
        setApplicationMessage('');
      } else {
        throw new Error(response.error?.message || 'Failed to submit application');
      }
    } catch (error: unknown) {
      console.error('Application submission error:', error);
      
      const axiosError = error as { response?: { status: number } };
      const errorWithMessage = error as { message?: string };
      
      if (axiosError.response?.status === 409) {
        toast.error('Application already submitted', {
          description: 'You have already applied to this listing.'
        });
        setHasApplied(true);
        setIsApplicationModalOpen(false);
      } else if (axiosError.response?.status === 400) {
        toast.error('Invalid application', {
          description: 'Please check your application message and try again.'
        });
      } else if (axiosError.response?.status === 401) {
        toast.error('Authentication required', {
          description: 'Please sign in to submit applications.'
        });
      } else if (axiosError.response?.status && axiosError.response.status >= 500) {
        toast.error('Server error', {
          description: 'Unable to submit application. Please try again later.'
        });
      } else {
        toast.error('Application failed', {
          description: errorWithMessage.message || 'An unexpected error occurred. Please try again.'
        });
      }
    } finally {
      setIsSubmittingApplication(false);
    }
  };

  const handleCloseModal = () => {
    if (!isSubmittingApplication) {
      setIsApplicationModalOpen(false);
      setApplicationMessage('');
    }
  };

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
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return <ListingDetailSkeleton />;
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-lg mx-auto pt-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error || 'Listing not found'}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/listings')}
              >
                Back to Listings
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto bg-white min-h-screen relative">
        
        {/* 1. Image Carousel */}
        <div className="relative">
          <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="bg-black/50 text-white hover:bg-black/70 rounded-full w-10 h-10 p-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="bg-black/50 text-white hover:bg-black/70 rounded-full w-10 h-10 p-0"
              >
                <Share2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="bg-black/50 text-white hover:bg-black/70 rounded-full w-10 h-10 p-0"
              >
                <Heart className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="relative h-80 bg-gray-200">
            {listing.photos && listing.photos.length > 0 ? (
              <>
                <img
                  src={listing.photos[currentPhotoIndex]}
                  alt={`${listing.title} - Photo ${currentPhotoIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {listing.photos.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 rounded-full w-10 h-10 p-0"
                      onClick={handlePrevPhoto}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 rounded-full w-10 h-10 p-0"
                      onClick={handleNextPhoto}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                    
                    <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                      {currentPhotoIndex + 1} / {listing.photos.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Home className="w-16 h-16" />
              </div>
            )}
          </div>
        </div>

        <div className="pb-20">
          
          {/* 2. Core Information */}
          <div className="p-4 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {listing.title}
            </h1>
            
            <div className="flex items-center text-gray-600 mb-3">
              <MapPin className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="text-base">{listing.location.address}</span>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Bed className="w-4 h-4 mr-1" />
                <span>{listing.details.bedrooms} bedroom{listing.details.bedrooms !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center">
                <Bath className="w-4 h-4 mr-1" />
                <span>{listing.details.bathrooms} bathroom{listing.details.bathrooms !== 1 ? 's' : ''}</span>
              </div>
              {listing.details.squareFootage && (
                <div className="flex items-center">
                  <Home className="w-4 h-4 mr-1" />
                  <span>{listing.details.squareFootage} sqft</span>
                </div>
              )}
            </div>
          </div>

          {/* 3. Price & Terms */}
          <Card className="m-4 border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Pricing & Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Monthly Rent</span>
                <span className="font-bold text-xl text-green-600">
                  {formatPrice(listing.pricing.monthlyRent, listing.pricing.currency)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Security Deposit</span>
                <span className="font-semibold">
                  {formatPrice(listing.pricing.deposit, listing.pricing.currency)}
                </span>
              </div>
              
              {listing.pricing.utilities > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Utilities</span>
                  <span className="font-semibold">
                    {formatPrice(listing.pricing.utilities, listing.pricing.currency)}/month
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Available from {formatDate(listing.availability.availableFrom)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 4. Amenities */}
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Features & Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {listing.details.furnished && (
                <Badge variant="secondary" className="text-sm py-1 px-3">
                  <Home className="w-4 h-4 mr-1" />
                  Furnished
                </Badge>
              )}
              {listing.details.petFriendly && (
                <Badge variant="secondary" className="text-sm py-1 px-3">
                  🐕 Pet Friendly
                </Badge>
              )}
              {listing.details.smokingAllowed && (
                <Badge variant="secondary" className="text-sm py-1 px-3">
                  🚬 Smoking OK
                </Badge>
              )}
              <Badge variant="secondary" className="text-sm py-1 px-3">
                <Wifi className="w-4 h-4 mr-1" />
                WiFi
              </Badge>
              <Badge variant="secondary" className="text-sm py-1 px-3">
                <Utensils className="w-4 h-4 mr-1" />
                Kitchen
              </Badge>
              <Badge variant="secondary" className="text-sm py-1 px-3">
                <Wind className="w-4 h-4 mr-1" />
                AC
              </Badge>
            </div>
          </div>

          {/* 5. Host & Roommates */}
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Host & Current Roommates</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Host</p>
                  <p className="text-sm text-gray-600">Posted this listing</p>
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                <p>👥 Looking for 1 more roommate</p>
                <p>🏠 2 people currently living here</p>
              </div>
            </div>
          </div>

          {/* 6. Description */}
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">About this place</h3>
            <p className="text-gray-700 leading-relaxed">
              {listing.description}
            </p>
          </div>

          {/* 7. Location */}
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Location</h3>
            <SimpleMap address={listing.location.address} className="mb-3" />
            <p className="text-gray-600 text-sm">{listing.location.address}</p>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-lg bg-white border-t border-gray-200 p-4">
          <Button 
            onClick={handleApply}
            className="w-full h-12 text-lg font-semibold"
            size="lg"
            disabled={hasApplied}
            variant={hasApplied ? "secondary" : "default"}
          >
            {hasApplied ? (
              <>
                <Check className="w-5 h-5 mr-2" />
                Application Sent
              </>
            ) : (
              "Apply to Join as Roommate"
            )}
          </Button>
        </div>

        {/* Application Modal */}
        <Dialog open={isApplicationModalOpen} onOpenChange={handleCloseModal}>
          <DialogContent className="sm:max-w-md mx-4">
            <DialogHeader>
              <DialogTitle>Apply to Join</DialogTitle>
              <DialogDescription>
                Send a message to the property owner introducing yourself and explaining why you'd be a great roommate.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="applicationMessage">Your Message</Label>
                <Textarea
                  id="applicationMessage"
                  placeholder="Hi! I'm interested in joining as a roommate. I'm a clean, responsible, and friendly person who values a peaceful living environment. I work as a..."
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                  className="min-h-[120px] resize-none"
                  maxLength={1000}
                  disabled={isSubmittingApplication}
                />
                <div className="text-xs text-gray-500 text-right">
                  {applicationMessage.length}/1000 characters
                </div>
              </div>
            </div>
            
            <DialogFooter className="gap-2">
              <Button 
                variant="outline" 
                onClick={handleCloseModal}
                disabled={isSubmittingApplication}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitApplication}
                disabled={isSubmittingApplication || !applicationMessage.trim()}
              >
                {isSubmittingApplication ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

const ListingDetailSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto bg-white">
        <Skeleton className="h-80 w-full" />
        
        <div className="p-4 space-y-6">
          <div>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-5 w-full mb-3" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          
          <div className="space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-20 w-full" />
          </div>
          
          <div className="space-y-3">
            <Skeleton className="h-6 w-40" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
          
          <div className="space-y-3">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetailPage; 