import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import SourceInputForm from '../components/SourceInputForm';
import ListingReviewForm from '../components/ListingReviewForm';
import { analyzeListingSource, AnalyzeSourceResponse, createListing } from '@/services/listingService';

type CreateStep = 'input' | 'review';

interface ListingFormData {
  title: string;
  monthlyRent: number;
  currency: string;
  deposit: number;
  utilities: number;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number | null;
  furnished: boolean;
  petFriendly: boolean;
  smokingAllowed: boolean;
  address: string;
  availableFrom: string;
  minimumStay: number;
  description: string;
  amenities: string[];
  photos: File[];
}

const CreateListingPage: React.FC = () => {
  const navigate = useNavigate();
  
  // State management
  const [currentStep, setCurrentStep] = useState<CreateStep>('input');
  const [isLoading, setIsLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [aiResultData, setAiResultData] = useState<AnalyzeSourceResponse['data'] | null>(null);

  // Handle AI analysis
  const handleAnalyzeSource = async (sourceText: string) => {
    try {
      setIsLoading(true);
      
      const response = await analyzeListingSource(sourceText);
      
      if (response.success && response.data) {
        setAiResultData(response.data);
        setCurrentStep('review');
        toast.success('AI analysis completed successfully!', {
          description: 'Review the extracted information and make any necessary adjustments.'
        });
      } else {
        throw new Error(response.error?.message || 'Analysis failed');
      }
    } catch (error: unknown) {
      console.error('AI analysis error:', error);
      
      // Handle different types of errors
      const axiosError = error as { response?: { status: number } };
      const errorWithMessage = error as { message?: string };
      
      if (axiosError.response?.status === 400) {
        toast.error('Invalid input provided', {
          description: 'Please check your text and try again.'
        });
      } else if (axiosError.response?.status === 429) {
        toast.error('Too many requests', {
          description: 'Please wait a moment before trying again.'
        });
      } else if (axiosError.response?.status && axiosError.response.status >= 500) {
        toast.error('Server error', {
          description: 'Our AI service is temporarily unavailable. Please try again later.'
        });
      } else {
        toast.error('Analysis failed', {
          description: errorWithMessage.message || 'An unexpected error occurred. Please try again.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle going back to input step
  const handleGoBack = () => {
    setCurrentStep('input');
    setAiResultData(null);
  };

  // Handle publishing listing
  const handlePublishListing = async (listingData: ListingFormData) => {
    try {
      setIsPublishing(true);

      // Convert form data to the format expected by the API
      const listingPayload = {
        title: listingData.title,
        description: listingData.description,
        monthlyRent: listingData.monthlyRent,
        currency: listingData.currency,
        deposit: listingData.deposit,
        utilities: listingData.utilities,
        bedrooms: listingData.bedrooms,
        bathrooms: listingData.bathrooms,
        squareFootage: listingData.squareFootage,
        furnished: listingData.furnished,
        petFriendly: listingData.petFriendly,
        smokingAllowed: listingData.smokingAllowed,
        address: listingData.address,
        availableFrom: listingData.availableFrom,
        minimumStay: listingData.minimumStay,
        amenities: listingData.amenities,
        // Note: Photo handling would need to be implemented based on your backend API
        // For now, we'll handle the creation without photos and add photo upload separately
      };

      const response = await createListing(listingPayload);
      
      if (response.success && response.data) {
        toast.success('Listing published successfully!', {
          description: 'Your property listing is now live and visible to potential renters.'
        });
        
        // Navigate to the new listing's detail page
        navigate(`/listings/${response.data.listingId}`);
      } else {
        throw new Error(response.error?.message || 'Failed to publish listing');
      }
    } catch (error: unknown) {
      console.error('Publish listing error:', error);
      
      // Handle different types of errors
      const axiosError = error as { response?: { status: number } };
      const errorWithMessage = error as { message?: string };
      
      if (axiosError.response?.status === 400) {
        toast.error('Invalid listing data', {
          description: 'Please check all required fields and try again.'
        });
      } else if (axiosError.response?.status === 401) {
        toast.error('Authentication required', {
          description: 'Please sign in to publish listings.'
        });
        navigate('/auth/signin');
      } else if (axiosError.response?.status === 403) {
        toast.error('Not authorized', {
          description: 'You do not have permission to publish listings.'
        });
      } else if (axiosError.response?.status && axiosError.response.status >= 500) {
        toast.error('Server error', {
          description: 'Unable to publish listing. Please try again later.'
        });
      } else {
        toast.error('Failed to publish listing', {
          description: errorWithMessage.message || 'An unexpected error occurred. Please try again.'
        });
      }
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center ${currentStep === 'input' ? 'text-blue-600' : 'text-green-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                currentStep === 'input' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-green-600 text-white'
              }`}>
                1
              </div>
              <span className="ml-2 font-medium">AI Analysis</span>
            </div>
            
            <div className={`w-12 h-1 ${currentStep === 'review' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
            
            <div className={`flex items-center ${currentStep === 'review' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                currentStep === 'review' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
              <span className="ml-2 font-medium">Review & Publish</span>
            </div>
          </div>
        </div>

        {/* Conditional rendering based on current step */}
        {currentStep === 'input' && (
          <SourceInputForm
            onAnalyze={handleAnalyzeSource}
            isLoading={isLoading}
          />
        )}

        {currentStep === 'review' && aiResultData && (
          <ListingReviewForm
            aiData={aiResultData}
            onPublish={handlePublishListing}
            onGoBack={handleGoBack}
            isPublishing={isPublishing}
          />
        )}
      </div>
    </div>
  );
};

export default CreateListingPage; 