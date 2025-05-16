// Define cafe data type returned from backend
export interface Cafe {
  placeId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  photos: string[];       // Array of photo URLs
  openingHours: string[]; // e.g. ["Monday: 7:30 AM – 4:00 PM", ...]
  isOpenNow: boolean;
  rating: number;
  userRatingsTotal: number;
  website?: string;      // optional
  phoneNumber?: string;  // optional
  priceLevel: number;     // -1 means unknown
  types: string[];
}

// Use this function to fetch cafe list from backend API
export const fetchCafes = async (): Promise<Cafe[]> => {
  try {
    const response = await fetch('/api/cafes');
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
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
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching details for cafe ID ${placeId}:`, error);
    throw error;
  }
};
