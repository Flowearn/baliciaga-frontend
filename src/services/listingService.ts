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
      locationArea?: string;
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
  includeStatus?: string[];
}

export const fetchListings = async ({ 
  pageParam, 
  limit = 10,
  includeStatus = ['active']
}: FetchListingsParams = {}): Promise<ListingsApiResponse> => {
  const params = new URLSearchParams();
  
  if (pageParam) {
    params.append('startCursor', pageParam);
  }
  
  params.append('limit', limit.toString());
  
  // Add status filters - default to active only
  includeStatus.forEach(status => {
    params.append('status', status);
  });
  
  const response = await apiClient.get(`/listings?${params.toString()}`);
  return response.data;
};

export const fetchListingById = async (listingId: string): Promise<{ success: boolean; data: Listing }> => {
  const response = await apiClient.get(`/listings/${listingId}`);
  return response.data;
};

export const analyzeListingSource = async (input: string | FormData): Promise<AnalyzeSourceResponse> => {
  if (input instanceof FormData) {
    // 处理FormData（图片）
    const response = await apiClient.post('/listings/analyze-source', input, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } else {
    // 处理文本
    const response = await apiClient.post('/listings/analyze-source', {
      sourceText: input
    });
    return response.data;
  }
};

export interface CreateListingPayload {
  title: string;
  posterRole: 'tenant' | 'landlord' | 'platform';
  monthlyRent: number;
  yearlyRent?: number | null;
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
  locationArea?: string;
  availableFrom: string;
  minimumStay: number;
  description: string;
  amenities: string[];
  photos: string[]; // 图片 URL 数组
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
  initiatorId: string;
  pricing: {
    monthlyRent: number;
    yearlyRent?: number | null;
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

export interface FinalizeListingResponse {
  success: boolean;
  data?: {
    listingId: string;
    status: string;
    updatedApplicationsCount: number;
    message: string;
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export const finalizeListing = async (listingId: string): Promise<FinalizeListingResponse> => {
  const response = await apiClient.patch(`/listings/${listingId}/finalize`);
  return response.data;
};

export interface CancelListingResponse {
  success: boolean;
  data?: {
    listingId: string;
    status: string;
    message: string;
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export const cancelListing = async (listingId: string): Promise<CancelListingResponse> => {
  const response = await apiClient.patch(`/listings/${listingId}/cancel`);
  return response.data;
}; 

export const incrementView = async (listingId: string): Promise<void> => {
  try {
    // Fire-and-forget, no need to await or handle response
    apiClient.post(`/listings/${listingId}/view`);
  } catch (error) {
    console.warn("Failed to increment view count, but continuing.", error);
  }
}; 

export interface UpdateListingPayload {
  title?: string;
  monthlyRent?: number;
  currency?: string;
  deposit?: number;
  utilities?: number;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number | null;
  furnished?: boolean;
  petFriendly?: boolean;
  smokingAllowed?: boolean;
  address?: string;
  availableFrom?: string;
  minimumStay?: number;
  description?: string;
  amenities?: string; // comma-separated string for backend
  photos?: string[]; // photo URL array
}

export interface UpdateListingResponse {
  success: boolean;
  data?: {
    listingId: string;
    message: string;
    listing: MyListing;
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export const updateListing = async (listingId: string, payload: UpdateListingPayload): Promise<UpdateListingResponse> => {
  const response = await apiClient.put(`/listings/${listingId}`, payload);
  return response.data;
}; 