import { createContext, useContext } from 'react';

// Define the structure for venue description data
export interface VenueDescriptionData {
  id: number;
  name: string;
  sections: Array<{
    title: string;
    body: string;
  }>;
}

type DescriptionsContextType = { [placeId: string]: VenueDescriptionData } | null;

const DescriptionsContext = createContext<DescriptionsContextType>(null);

export const DescriptionsProvider = DescriptionsContext.Provider;

export const useDescriptions = () => {
  const context = useContext(DescriptionsContext);
  if (context === undefined) {
    throw new Error('useDescriptions must be used within a DescriptionsProvider');
  }
  return context;
};