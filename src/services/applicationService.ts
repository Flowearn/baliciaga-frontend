import apiClient from './apiClient';

export interface CreateApplicationPayload {
  message: string;
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
  message: string
): Promise<CreateApplicationResponse> => {
  const response = await apiClient.post(`/listings/${listingId}/applications`, {
    message
  });
  return response.data;
};

export interface MyApplication {
  applicationId: string;
  listingId: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'signed';
  createdAt: string;
  listing: {
    title: string;
    monthlyRent: number;
    currency: string;
    address: string;
    photos: string[];
    bedrooms: number;
    bathrooms: number;
  };
}

export interface FetchMyApplicationsParams {
  pageParam?: string;
  limit?: number;
  status?: 'pending' | 'accepted' | 'rejected' | 'signed' | 'all';
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