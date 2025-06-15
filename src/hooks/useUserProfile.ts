import { useState, useEffect } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import axios from 'axios';
import { fetchUserProfile, UserProfile } from '../services/userService';

export interface UserProfileState {
  userProfile: UserProfile | null;
  profileExists: boolean | null;
  isLoading: boolean;
  error: string | null;
}

export const useUserProfile = () => {
  const { user } = useAuthenticator((context) => [context.user]);
  const [profileExists, setProfileExists] = useState<boolean | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only check user profile if user is logged in
    if (!user) {
      setProfileExists(null);
      setUserProfile(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    const checkUserProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const profile = await fetchUserProfile();
        setUserProfile(profile);
        setProfileExists(true);
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          // This is the expected "new user" case
          console.log("New user detected. No profile found.");
          setProfileExists(false);
          setUserProfile(null);
        } else {
          // This is an unexpected error (like 500 error or network issues)
          console.error("An unexpected error occurred during profile check:", error);
          setError('Failed to fetch user information. Please try again.');
          setProfileExists(null);
          setUserProfile(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkUserProfile();
  }, [user]);

  const refreshProfile = async (): Promise<void> => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const profile = await fetchUserProfile();
      setUserProfile(profile);
      setProfileExists(true);
    } catch (error) {
      console.error('Error refreshing profile:', error);
      setError('Failed to refresh user information');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    userProfile,
    profileExists,
    isLoading,
    error,
    refreshProfile,
    hasProfile: profileExists === true,
    needsProfile: user && profileExists === false,
    isAuthenticated: !!user,
  };
}; 