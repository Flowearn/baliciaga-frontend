import apiClient from './apiClient';

export interface UserProfile {
  userId: string;
  email: string;
  profile: {
    name: string;
    whatsApp: string;
    gender?: 'male' | 'female' | 'other';
    age?: number;
    nationality?: string;
    socialMedia?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserProfileData {
  fullName: string;
  gender: 'male' | 'female' | 'other';
  nationality: string;
  age: number;
  whatsapp: string;
}

export const fetchUserProfile = async (): Promise<UserProfile> => {
  const response = await apiClient.get('/users/me');
  return response.data.data; // Backend returns { success: true, data: {...} }
};

export const createUserProfile = async (profileData: CreateUserProfileData): Promise<UserProfile> => {
  // Transform frontend format to backend format
  const backendPayload = {
    profile: {
      name: profileData.fullName,
      whatsApp: profileData.whatsapp,
      gender: profileData.gender,
      age: profileData.age,
      nationality: profileData.nationality,
    }
  };
  
  const response = await apiClient.post('/users/profile', backendPayload);
  return response.data.data; // Backend returns { success: true, data: {...} }
}; 