import { QueryClient } from '@tanstack/react-query';
import type { Cafe } from '../services/cafeService';

/**
 * Helper function to add a cafe detail to the React Query cache
 * This can be used to prefetch cafe details from the list page
 */
export const addCafeToCache = (
  queryClient: QueryClient, 
  cafe: Cafe
) => {
  // Add the individual cafe to the cache with its own query key
  queryClient.setQueryData(['cafeDetails', cafe.placeId], cafe);
};

/**
 * Ensure a list of cafes are available in the cache
 * This is useful for the initial load of the cafe list
 */
export const preCacheCafes = (
  queryClient: QueryClient,
  cafes: Cafe[]
) => {
  // First set the list cache
  queryClient.setQueryData(['cafes'], cafes);
  
  // Then add each cafe to its individual cache entry
  cafes.forEach(cafe => {
    addCafeToCache(queryClient, cafe);
  });
}; 