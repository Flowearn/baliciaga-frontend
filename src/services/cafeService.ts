import { type Cafe } from '../types'; // Import the centralized Cafe type

// Use this function to fetch cafe list from backend API
export const fetchCafes = async (): Promise<Cafe[]> => {
  try {
    const response = await fetch('/api/cafes');
    
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
    const response = await fetch(`/api/cafes/${placeId}`);
    
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
