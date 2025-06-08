import apiClient from './apiClient';
import { Listing, ListingsApiResponse } from '@/types';

export interface AnalyzeSourceResponse {
  success: boolean;
  data: {
    extractedListing: {
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
    };
    sourceText: string;
    aiProcessedAt: string;
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface FetchListingsParams {
  pageParam?: string;
  limit?: number;
}

export const fetchListings = async ({ 
  pageParam, 
  limit = 10 
}: FetchListingsParams = {}): Promise<ListingsApiResponse> => {
  const params = new URLSearchParams();
  
  if (pageParam) {
    params.append('startCursor', pageParam);
  }
  
  params.append('limit', limit.toString());
  params.append('status', 'active'); // Only fetch active listings
  
  const response = await apiClient.get(`/listings?${params.toString()}`);
  return response.data;
};

export const fetchListingById = async (listingId: string): Promise<{ success: boolean; data: Listing }> => {
  const response = await apiClient.get(`/listings/${listingId}`);
  return response.data;
};

export const analyzeListingSource = async (sourceText: string): Promise<AnalyzeSourceResponse> => {
  const response = await apiClient.post('/listings/analyze-source', {
    sourceText
  });
  return response.data;
};

export interface CreateListingPayload {
  title: string;
  description: string;
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
  amenities: string[];
}

export interface CreateListingResponse {
  success: boolean;
  data?: {
    listingId: string;
    message: string;
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export const createListing = async (payload: CreateListingPayload): Promise<CreateListingResponse> => {
  const response = await apiClient.post('/listings', payload);
  return response.data;
};

export interface MyListing {
  listingId: string;
  title: string;
  description: string;
  pricing: {
    monthlyRent: number;
    currency: string;
    deposit: number;
    utilities: number;
  };
  details: {
    bedrooms: number;
    bathrooms: number;
    squareFootage: number | null;
    furnished: boolean;
    petFriendly: boolean;
    smokingAllowed: boolean;
  };
  location: {
    address: string;
    coordinates: number[] | null;
  };
  availability: {
    availableFrom: string;
    minimumStay: number;
  };
  photos: string[];
  amenities: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
  // Additional fields for owner view
  applicationsCount: number;
  viewsCount: number;
}

export interface FetchMyListingsParams {
  pageParam?: string;
  limit?: number;
  status?: string;
}

export interface MyListingsApiResponse {
  success: boolean;
  data: {
    listings: MyListing[];
    pagination: {
      nextCursor: string | null;
      hasNextPage: boolean;
      totalCount: number;
      returnedCount: number;
    };
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export const fetchMyListings = async ({ 
  pageParam, 
  limit = 10,
  status = 'active'
}: FetchMyListingsParams = {}): Promise<MyListingsApiResponse> => {
  const params = new URLSearchParams();
  
  if (pageParam) {
    params.append('startCursor', pageParam);
  }
  
  params.append('limit', limit.toString());
  params.append('status', status);
  
  const response = await apiClient.get(`/users/me/listings?${params.toString()}`);
  return response.data;
}; 