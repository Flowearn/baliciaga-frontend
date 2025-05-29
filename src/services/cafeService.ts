import { type Cafe } from '../types'; // Import the centralized Cafe type

// Get the API base URL from environment variables with a fallback for local development
console.log('DEBUG: cafeService.ts loaded - initiation');
console.log('DEBUG: VITE_API_BASE_URL from import.meta.env:', import.meta.env.VITE_API_BASE_URL);
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3006/dev';
console.log('DEBUG: Effective API_BASE_URL used in cafeService:', API_BASE_URL);
console.log('DEBUG: Typeof API_BASE_URL:', typeof API_BASE_URL);

// Use this function to fetch cafe/bar list from backend API based on category
export const fetchCafes = async (category: 'cafe' | 'bar' = 'cafe'): Promise<Cafe[]> => {
  console.log('DEBUG: fetchCafes() function called with category:', category);
  
  // Build the API endpoint based on category
  const endpoint = `${API_BASE_URL}/places?type=${category}`;
  console.log('DEBUG: About to fetch from URL:', endpoint);
  
  try {
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error('API Error Body:', errorBody);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data: Cafe[] = await response.json();
    console.log('DEBUG: Successfully fetched data, count:', data.length, 'for category:', category);
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

// Get details for a single place
export const fetchPlaceDetails = async (placeId: string, categoryType: 'cafe' | 'bar' = 'cafe'): Promise<Cafe> => {
  console.log('DEBUG: fetchPlaceDetails() called for placeId:', placeId, 'categoryType:', categoryType);
  
  // Build the API endpoint with categoryType
  const endpoint = `${API_BASE_URL}/places/${placeId}?type=${categoryType}`;
  console.log('DEBUG: About to fetch from URL:', endpoint);
  
  try {
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error('API Error Body:', errorBody);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data: Cafe = await response.json();
    console.log('DEBUG: Successfully fetched place details for:', data.name);
    return data;
  } catch (error) {
    console.error(`Error fetching details for place ID ${placeId} with category ${categoryType}:`, error);
    throw error;
  }
};

// Backward compatibility - keep the old function for any existing usage
export const fetchCafeDetails = fetchPlaceDetails;
