/**
 * Convert a string to a URL-friendly slug
 * @param text - The text to convert
 * @returns URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

/**
 * Generate a mapping of slugs to place IDs
 * @param places - Array of places with name and placeId
 * @returns Object mapping slug to placeId
 */
export function generateSlugMapping(places: Array<{ name: string; placeId: string }>) {
  const mapping: Record<string, string> = {};
  
  places.forEach(place => {
    const slug = slugify(place.name);
    mapping[slug] = place.placeId;
  });
  
  return mapping;
}