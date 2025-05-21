import { type Cafe } from '../types'; // Import the centralized Cafe type

// Get the API base URL from environment variables with a fallback for local development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3006/dev';

// Use this function to fetch cafe list from backend API
export const fetchCafes = async (): Promise<Cafe[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/cafes`);
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error('API Error Body:', errorBody);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data: Cafe[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching cafe data:', error);
    throw error;
  }
};

// Get details for a single cafe
export const fetchCafeDetails = async (placeId: string): Promise<Cafe> => {
  try {
    const response = await fetch(`${API_BASE_URL}/cafes/${placeId}`);
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error('API Error Body:', errorBody);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data: Cafe = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching details for cafe ID ${placeId}:`, error);
    throw error;
  }
};
