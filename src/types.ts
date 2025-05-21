export interface Cafe {
  placeId: string;
  name: string;
  address: string; // Full address, replacing vicinity
  latitude: number;
  longitude: number;
  photos: string[]; // Array of photo URLs, directly from backend
  openingHours: string[]; // Array of strings, e.g., "Monday: 8:00 AM – 5:00 PM"
  isOpenNow: boolean;
  website?: string; // Optional
  phoneNumber?: string; // Optional
  instagram?: string; // Optional
  priceLevel: number; // 0-4
  types: string[]; // Array of type strings
  rating: number;
  userRatingsTotal: number;
  region: string;
  businessStatus: string; // e.g., "OPERATIONAL"
  googleMapsUri?: string; // Optional
  staticMapS3Url?: string; // Optional, pre-generated static map image URL from S3
} 