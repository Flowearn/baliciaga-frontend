import apiClient from './apiClient';

export interface CreateApplicationPayload {
  message: string;
  applicantLeaseDuration?: string;
}

export interface CreateApplicationResponse {
  success: boolean;
  data?: {
    applicationId: string;
    message: string;
    status: string;
    createdAt: string;
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export const createApplication = async (
  listingId: string, 
  message: string,
  applicantLeaseDuration?: string
): Promise<CreateApplicationResponse> => {
  const payload: CreateApplicationPayload = { message };
  
  if (applicantLeaseDuration) {
    payload.applicantLeaseDuration = applicantLeaseDuration;
  }
  
  console.log('[FRONTEND-CREATE-DIAGNOSIS] Request Body:', payload);
  
  const response = await apiClient.post(`/listings/${listingId}/applications`, payload);
  return response.data;
};

export interface MyApplication {
  applicationId: string;
  listingId: string;
  message: string;
  status: 'pending' | 'accepted' | 'ignored' | 'finalized';
  createdAt: string;
  acceptedRoommates?: Array<{
    userId: string;
    email: string;
    profile: {
      name?: string;
      whatsApp?: string;
      gender?: 'male' | 'female' | 'other';
      age?: number;
      languages?: string[];
      occupation?: string;
      nationality?: string;
      profilePictureUrl?: string | null;
    };
  }>;
  listing: {
    title: string;
    description: string;
    location: {
      address: string;
      coordinates: {
        latitude: number;
        longitude: number;
      };
      area?: string;
    };
    pricing: {
      monthlyRent: number;
      yearlyRent: number;
      deposit: number;
      utilities: number;
      currency: string;
    };
    details: {
      bedrooms: number;
      bathrooms: number;
      squareFootage: number | null;
      furnished: boolean;
      petFriendly: boolean;
      smokingAllowed: boolean;
    };
    photos: string[];
    availability: {
      availableFrom: string;
      minimumStay: number;
      maximumStay: number | null;
    };
    status: string;
    acceptedApplicantsCount: number;
    totalSpots: number;
    locationArea?: string;
    address?: string; // 保持向后兼容
  };
}

export interface FetchMyApplicationsParams {
  pageParam?: string;
  limit?: number;
  status?: 'pending' | 'accepted' | 'ignored' | 'finalized' | 'all';
}

export interface MyApplicationsApiResponse {
  success: boolean;
  data?: {
    applications: MyApplication[];
    pagination: {
      nextCursor: string | null;
      hasNextPage: boolean;
      totalCount: number;
    };
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export const fetchMyApplications = async ({ 
  pageParam, 
  limit = 10,
  status = 'all'
}: FetchMyApplicationsParams = {}): Promise<MyApplicationsApiResponse> => {
  const params = new URLSearchParams();
  
  if (pageParam) {
    params.append('startCursor', pageParam);
  }
  
  params.append('limit', limit.toString());
  
  if (status !== 'all') {
    params.append('status', status);
  }
  
  const response = await apiClient.get(`/users/me/applications?${params.toString()}`);
  return response.data;
};

// Interfaces for listing applications management
export interface ReceivedApplication {
  applicationId: string;
  listingId: string;
  message: string;
  status: 'pending' | 'accepted' | 'ignored';
  createdAt: string;
  applicant: {
    userId: string;
    cognitoSub: string;
    email: string;
    profile: {
      name: string;
      whatsApp: string;
      age?: number;
      nationality?: string;
      occupation?: string;
      bio?: string;
      profilePicture?: string;
      languages?: string[];
    };
  };
}

export interface FetchApplicationsForListingParams {
  pageParam?: string;
  limit?: number;
  status?: 'pending' | 'accepted' | 'ignored' | 'all';
}

export interface ListingApplicationsApiResponse {
  success: boolean;
  data?: {
    applications: ReceivedApplication[];
    listing: {
      listingId: string;
      title: string;
      address: string;
      monthlyRent: number;
      currency: string;
    };
    pagination: {
      nextCursor: string | null;
      hasNextPage: boolean;
      totalCount: number;
    };
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export const fetchApplicationsForListing = async (
  listingId: string,
  { pageParam, limit = 10, status = 'all' }: FetchApplicationsForListingParams = {}
): Promise<ListingApplicationsApiResponse> => {
  const params = new URLSearchParams();
  
  if (pageParam) {
    params.append('startCursor', pageParam);
  }
  
  params.append('limit', limit.toString());
  
  if (status !== 'all') {
    params.append('status', status);
  }
  
  const response = await apiClient.get(`/listings/${listingId}/applications?${params.toString()}`);
  return response.data;
};

export interface UpdateApplicationStatusPayload {
  status: 'accepted' | 'ignored' | 'pending';
}

export interface UpdateApplicationStatusResponse {
  success: boolean;
  data?: {
    applicationId: string;
    newStatus: string;
    message: string;
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export const updateApplicationStatus = async (
  applicationId: string,
  status: 'accepted' | 'ignored' | 'pending'
): Promise<UpdateApplicationStatusResponse> => {
  const response = await apiClient.put(`/applications/${applicationId}`, {
    status
  });
  return response.data;
};

// 取消申请接口
export interface CancelApplicationResponse {
  success: boolean;
  data?: {
    applicationId: string;
    message: string;
    application?: MyApplication;
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export const cancelApplication = async (applicationId: string): Promise<CancelApplicationResponse> => {
  try {
    const response = await apiClient.patch(`/applications/${applicationId}/cancel`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`Error canceling application ${applicationId}:`, error);
    return { success: false, error };
  }
}; 