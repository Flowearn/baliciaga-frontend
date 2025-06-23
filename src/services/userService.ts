import apiClient from './apiClient';

export interface UserProfile {
  userId: string;
  email: string;
  profile: {
    name: string;
    whatsApp: string;
    gender?: 'male' | 'female' | 'other';
    age?: number;
    languages?: string[];
    socialMedia?: string;
    occupation?: string;
    profilePictureUrl?: string;
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

export interface UpdateUserProfileData {
  name?: string;
  whatsApp?: string;
  gender?: 'male' | 'female' | 'other';
  age?: number;
  languages?: string[];
  socialMedia?: string;
  occupation?: string;
  profilePictureUrl?: string;
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

export const updateUserProfile = async (profileData: UpdateUserProfileData): Promise<UserProfile> => {
  // 使用相同的端点，因为后端的createUserProfile实际上是upsert操作
  const backendPayload = {
    profile: profileData
  };
  
  console.log('🔄 Updating user profile with payload:', backendPayload);
  
  try {
    const response = await apiClient.post('/users/profile', backendPayload);
    console.log('✅ Profile update response:', response.data);
    return response.data.data; // Backend returns { success: true, data: {...} }
  } catch (error: any) {
    console.error('❌ Profile update failed:', error.response?.data || error.message);
    throw error;
  }
}; 