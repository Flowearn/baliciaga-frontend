import { type Cafe } from '../types'; // Import the centralized Cafe type

// Get the API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL environment variable is not set');
}

// Helper function to convert DynamoDB format to plain values
function convertDynamoDBValue(value: any): any {
  if (value === null || value === undefined) return value;
  
  // Handle DynamoDB number format {N: "123"}
  if (typeof value === 'object' && 'N' in value) {
    return parseFloat(value.N);
  }
  
  // Handle DynamoDB string format {S: "string"}
  if (typeof value === 'object' && 'S' in value) {
    return value.S;
  }
  
  // Handle DynamoDB boolean format {BOOL: true}
  if (typeof value === 'object' && 'BOOL' in value) {
    return value.BOOL;
  }
  
  // Handle DynamoDB list format {L: [...]}
  if (typeof value === 'object' && 'L' in value) {
    return value.L.map(convertDynamoDBValue);
  }
  
  // Handle DynamoDB map format {M: {...}}
  if (typeof value === 'object' && 'M' in value) {
    const result: any = {};
    for (const [key, val] of Object.entries(value.M)) {
      result[key] = convertDynamoDBValue(val);
    }
    return result;
  }
  
  // Return value as-is if it's not in DynamoDB format
  return value;
}

// Helper function to normalize cafe data
function normalizeCafeData(cafe: any): Cafe {
  // Convert all fields from DynamoDB format
  const normalized: any = {};
  
  for (const [key, value] of Object.entries(cafe)) {
    normalized[key] = convertDynamoDBValue(value);
  }
  
  // Extract venueAttributes if present
  let extractedAttributes = {};
  if (normalized.venueAttributes) {
    extractedAttributes = {
      cuisineStyle: normalized.venueAttributes.cuisineStyle || normalized.cuisineStyle,
      atmosphere: normalized.venueAttributes.ambienceVibe || normalized.venueAttributes.atmosphere || normalized.atmosphere,
      signatureDishes: normalized.venueAttributes.signatureDishes || normalized.signatureDishes,
      drinkFocus: normalized.venueAttributes.drinkFocus || normalized.drinkFocus,
      barType: normalized.venueAttributes.barType || normalized.barType,
      signatureDrinks: normalized.venueAttributes.signatureDrinks || normalized.signatureDrinks,
    };
  }
  
  // Ensure specific fields are the correct type
  return {
    ...normalized,
    ...extractedAttributes, // Spread extracted attributes to override
    // Ensure numeric fields
    rating: typeof normalized.rating === 'number' ? normalized.rating : 0,
    userRatingsTotal: typeof normalized.userRatingsTotal === 'number' ? normalized.userRatingsTotal : 0,
    priceLevel: typeof normalized.priceLevel === 'number' ? normalized.priceLevel : 0,
    latitude: typeof normalized.latitude === 'number' ? normalized.latitude : 0,
    longitude: typeof normalized.longitude === 'number' ? normalized.longitude : 0,
    // Ensure string fields
    placeId: normalized.placeId || '',
    name: normalized.name || '',
    address: normalized.address || '',
    region: normalized.region || '',
    businessStatus: normalized.businessStatus || '',
    // Ensure array fields
    photos: Array.isArray(normalized.photos) ? normalized.photos : [],
    openingHours: Array.isArray(normalized.openingHours) ? normalized.openingHours : [],
    types: Array.isArray(normalized.types) ? normalized.types : [],
    signatureDishes: extractedAttributes.signatureDishes || (Array.isArray(normalized.signatureDishes) ? normalized.signatureDishes : []),
    // Ensure boolean fields
    isOpenNow: typeof normalized.isOpenNow === 'boolean' ? normalized.isOpenNow : false,
    // Keep optional fields as-is
    website: normalized.website,
    phoneNumber: normalized.phoneNumber,
    instagram: normalized.instagram,
    googleMapsUri: normalized.googleMapsUri,
    staticMapS3Url: normalized.staticMapS3Url,
    gofoodUrl: normalized.gofoodUrl,
    tableUrl: normalized.tableUrl,
    menuUrl: normalized.menuUrl,
    category: normalized.category,
    cuisineStyle: extractedAttributes.cuisineStyle || normalized.cuisineStyle,
    atmosphere: extractedAttributes.atmosphere || normalized.atmosphere,
    allowsDogs: normalized.allowsDogs,
    outdoorSeating: normalized.outdoorSeating,
    servesVegetarianFood: normalized.servesVegetarianFood,
    // Bar specific fields
    barType: extractedAttributes.barType || normalized.barType,
    drinkFocus: extractedAttributes.drinkFocus || normalized.drinkFocus,
    signatureDrinks: extractedAttributes.signatureDrinks || (Array.isArray(normalized.signatureDrinks) ? normalized.signatureDrinks : []),
    priceRange: normalized.priceRange,
  };
}

// Use this function to fetch cafe/bar/cowork/food/dining list from backend API based on category
export const fetchCafes = async (category: 'cafe' | 'bar' | 'cowork' | 'food' | 'dining' = 'cafe'): Promise<Cafe[]> => {
  // Build the API endpoint based on category
  const endpoint = `${API_BASE_URL}/places?type=${category}`;
  
  const response = await fetch(endpoint);
  
  if (!response.ok) {
    const errorBody = await response.text();
    console.error('API Error Body:', errorBody);
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Debug: Log the first item to see its structure
  if (data.length > 0) {
    console.log('Sample cafe data from API:', JSON.stringify(data[0], null, 2));
  }
  
  // Normalize each cafe data to handle potential DynamoDB format
  return data.map(normalizeCafeData);
};

// Get details for a single place
export const fetchPlaceDetails = async (placeId: string, categoryType: 'cafe' | 'bar' | 'cowork' | 'food' | 'dining' = 'cafe'): Promise<Cafe> => {
  // Build the API endpoint with categoryType
  const endpoint = `${API_BASE_URL}/places/${placeId}?type=${categoryType}`;
  
  const response = await fetch(endpoint);
  
  if (!response.ok) {
    const errorBody = await response.text();
    console.error('API Error Body:', errorBody);
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  // Normalize the cafe data to handle potential DynamoDB format
  return normalizeCafeData(data);
};

// Backward compatibility - keep the old function for any existing usage
export const fetchCafeDetails = fetchPlaceDetails;
