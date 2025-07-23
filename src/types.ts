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
  gofoodUrl?: string; // Optional, GoFood delivery URL
  allowsDogs?: boolean; // Optional, whether the cafe allows dogs
  outdoorSeating?: boolean; // Optional, whether the cafe has outdoor seating
  servesVegetarianFood?: boolean; // Optional, whether the cafe serves vegetarian food
  "tableUrl"?: string; // Optional, table booking URL
  "menuUrl"?: string; // Optional, menu URL
  category?: 'cafe' | 'dining'; // Optional, used for food category filtering
  cuisineStyle?: string | string[]; // Optional, cuisine type(s)
  atmosphere?: string | string[]; // Optional, atmosphere descriptions
  signatureDishes?: string[]; // Optional, signature dishes
  address?: string; // Optional, full address
  // Bar specific fields
  barType?: string | string[]; // Optional, bar type(s)
  drinkFocus?: string | string[]; // Optional, drink focus areas
  signatureDrinks?: string[]; // Optional, signature drinks
  priceRange?: string; // Optional, price range
}

// Rental Listing Types
export interface Listing {
  listingId: string;
  title: string;
  description: string;
  location: {
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  pricing: {
    monthlyRent: number;
    yearlyRent: number;
    deposit: number;
    utilities: number;
    currency: string;
  };
  details: {
    bedrooms: number;
    bathrooms: number;
    squareFootage?: number;
    furnished: boolean;
    petFriendly: boolean;
    smokingAllowed: boolean;
  };
  photos: string[];
  availability: {
    availableFrom: string;
    minimumStay: number;
    maximumStay?: number;
    leaseDuration?: string;
  };
  propertyContact?: string;
  status: 'active' | 'cancelled' | 'finalized' | 'open';
  initiatorId: string;
  acceptedApplicantsCount: number;
  totalSpots: number;
  createdAt: string;
  updatedAt: string;
  initiator: {
    id: string;
    name: string;
    profilePictureUrl?: string | null;
    role: 'tenant' | 'landlord' | 'platform';
    whatsApp?: string | null;
  };
}

export interface ListingsPagination {
  hasMore: boolean;
  nextCursor: string | null;
  totalCount: number;
}

export interface ListingsApiResponse {
  success: boolean;
  data: {
    listings: Listing[];
    pagination: ListingsPagination;
  };
}

export interface ListingFormData {
  title: string;
  monthlyRent: number;
  currency: string;
  deposit: number;
  utilities: number;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number | null;
  furnished: boolean;
  petFriendly: boolean;
  smokingAllowed: boolean;
  address: string;
  availableFrom: string;
  minimumStay: number;
  description: string;
  amenities: string[];
  photos: File[];
} 