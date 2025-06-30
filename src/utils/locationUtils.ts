/**
 * Location utility functions for consistent location display across the application
 */

/**
 * Extract and display location area/district from a location object
 * This function intelligently extracts area information from various location formats
 * 
 * @param location - Location object that may contain address, locationArea, or city
 * @returns Display-friendly location string (area/district name or full address as fallback)
 */
export function getLocationDisplay(location: { 
  address?: string; 
  locationArea?: string; 
  area?: string;
  city?: string;
  [key: string]: any;
}): string {
  // First check if there's a locationArea field (extended support)
  if (location.locationArea && location.locationArea.trim()) {
    return location.locationArea.trim();
  }
  
  // Check if there's an area field (from backend response)
  if (location.area && location.area.trim()) {
    return location.area.trim();
  }
  
  // Check if there's a city field (extended support)
  if (location.city && location.city.trim()) {
    return location.city.trim();
  }
  
  // Fallback to extracting from address
  if (!location.address) {
    return 'Location not available';
  }
  
  // Extract area information from address intelligently
  const parts = location.address.split(',').map(part => part.trim());
  
  // Try to identify area names (usually non-numeric parts, excluding postal codes)
  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i];
    // Skip pure numbers (postal codes) and country names
    if (!/^\d+$/.test(part) && part.toLowerCase() !== 'indonesia' && part.toLowerCase() !== 'bali') {
      // If it contains common area names, prioritize returning it
      if (/canggu|ubud|seminyak|kuta|sanur|denpasar|jimbaran|nusa dua/i.test(part)) {
        return part;
      }
      // Otherwise return the first non-numeric non-country part
      if (part.length > 2) {
        return part;
      }
    }
  }
  
  // Fallback: return the last non-numeric part or full address
  const lastNonNumericPart = parts.find(part => !/^\d+$/.test(part));
  return lastNonNumericPart || location.address;
}