import { type Cafe } from '../types'; // Import the centralized Cafe type

// Get the API base URL from environment variables with a fallback for local development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3006/dev';

// Use this function to fetch cafe/bar/cowork list from backend API based on category
export const fetchCafes = async (category: 'cafe' | 'bar' | 'cowork' = 'cafe'): Promise<Cafe[]> => {
  // Build the API endpoint based on category
  const endpoint = `${API_BASE_URL}/places?type=${category}`;
  
  const response = await fetch(endpoint);
  
  if (!response.ok) {
    const errorBody = await response.text();
    console.error('API Error Body:', errorBody);
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  
  const data: Cafe[] = await response.json();
  return data;
};

// Get details for a single place
export const fetchPlaceDetails = async (placeId: string, categoryType: 'cafe' | 'bar' | 'cowork' = 'cafe'): Promise<Cafe> => {
  // Build the API endpoint with categoryType
  const endpoint = `${API_BASE_URL}/places/${placeId}?type=${categoryType}`;
  
  const response = await fetch(endpoint);
  
  if (!response.ok) {
    const errorBody = await response.text();
    console.error('API Error Body:', errorBody);
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  
  const data: Cafe = await response.json();
  return data;
};

// Backward compatibility - keep the old function for any existing usage
export const fetchCafeDetails = fetchPlaceDetails;
