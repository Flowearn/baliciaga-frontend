import { type Cafe } from '../types'; // Import the centralized Cafe type

// Get the API base URL from environment variables with a fallback for local development
console.log('DEBUG: cafeService.ts loaded - initiation');
console.log('DEBUG: VITE_API_BASE_URL from import.meta.env:', import.meta.env.VITE_API_BASE_URL);
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3006/dev';
console.log('DEBUG: Effective API_BASE_URL used in cafeService:', API_BASE_URL);
console.log('DEBUG: Typeof API_BASE_URL:', typeof API_BASE_URL);

// Use this function to fetch cafe list from backend API
export const fetchCafes = async (): Promise<Cafe[]> => {
  console.log('DEBUG: fetchCafes() function called');
  console.log('DEBUG: About to fetch from URL:', `${API_BASE_URL}/cafes`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/cafes`);
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error('API Error Body:', errorBody);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data: Cafe[] = await response.json();
    console.log('DEBUG: Successfully fetched cafe data, count:', data.length);
    return data;
  } catch (error) {
    console.error('Error fetching cafe data:', error);
    throw error;
  }
};

// Get details for a single cafe
export const fetchCafeDetails = async (placeId: string): Promise<Cafe> => {
  console.log('DEBUG: fetchCafeDetails() called for placeId:', placeId);
  console.log('DEBUG: About to fetch from URL:', `${API_BASE_URL}/cafes/${placeId}`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/cafes/${placeId}`);
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error('API Error Body:', errorBody);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data: Cafe = await response.json();
    console.log('DEBUG: Successfully fetched cafe details for:', data.name);
    return data;
  } catch (error) {
    console.error(`Error fetching details for cafe ID ${placeId}:`, error);
    throw error;
  }
};
