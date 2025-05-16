import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import CafeCard from '../components/CafeCard';
import CafeDetail from '../components/CafeDetail';
import CafeForm from '../components/CafeForm';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { fetchCafes, type Cafe } from '../services/cafeService';
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [isAddingCafe, setIsAddingCafe] = useState(false);
  
  // Use React Query to fetch cafe data
  const { data: cafes, isLoading, error } = useQuery({
    queryKey: ['cafes'],
    queryFn: fetchCafes,
    // Use initial data as fallback until backend request completes
    placeholderData: [
      {
        placeId: '1',
        name: 'Two Face Coffee',
        address: 'Jl. Pantai Berawa No.20, Canggu, Bali',
        latitude: -8.650337,
        longitude: 115.159063,
        photos: ['https://via.placeholder.com/400x300?text=Two+Face+Coffee'],
        openingHours: [
          'Monday: 7:30 AM – 4:00 PM',
          'Tuesday: 7:30 AM – 4:00 PM',
          'Wednesday: 7:30 AM – 4:00 PM',
          'Thursday: 7:30 AM – 4:00 PM',
          'Friday: 7:30 AM – 4:00 PM',
          'Saturday: 7:30 AM – 4:00 PM',
          'Sunday: 7:30 AM – 4:00 PM'
        ],
        isOpenNow: true,
        rating: 4.5,
        userRatingsTotal: 512,
        website: 'https://twofacecoffee.com',
        priceLevel: 2,
        types: ['cafe', 'restaurant', 'food', 'point_of_interest', 'establishment']
      },
      {
        placeId: '2',
        name: 'Satu Jalan Coffee',
        address: 'Jl. Batu Bolong No.64, Canggu, Bali',
        latitude: -8.651857,
        longitude: 115.131256,
        photos: ['https://via.placeholder.com/400x300?text=Satu+Jalan+Coffee'],
        openingHours: [
          'Monday: 7:00 AM – 6:00 PM',
          'Tuesday: 7:00 AM – 6:00 PM',
          'Wednesday: 7:00 AM – 6:00 PM',
          'Thursday: 7:00 AM – 6:00 PM',
          'Friday: 7:00 AM – 6:00 PM',
          'Saturday: 7:00 AM – 6:00 PM',
          'Sunday: 7:00 AM – 6:00 PM'
        ],
        isOpenNow: true,
        rating: 4.7,
        userRatingsTotal: 328,
        priceLevel: 2,
        types: ['cafe', 'restaurant', 'food', 'point_of_interest', 'establishment']
      }
    ]
  });
  
  // Show error message when request fails
  React.useEffect(() => {
    if (error) {
      toast({
        title: "Failed to load data",
        description: "Unable to fetch cafe data from server. Please try again later.",
        variant: "destructive"
      });
      console.error("Error loading data:", error);
    }
  }, [error]);
  
  const filteredCafes = cafes 
    ? cafes.filter(cafe => cafe.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  const handleAddCafe = (newCafe: Cafe) => {
    // This should send a POST request to backend to save the new cafe
    // For demonstration, we just add it to local state
    toast({
      title: "Added successfully",
      description: `Successfully added cafe: ${newCafe.name}`
    });
    setIsAddingCafe(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 pb-20">
      {/* Header */}
      <div className="py-6">
        <h1 className="text-2xl text-center font-bold text-black">Baliciaga</h1>
        <p className="text-center text-gray-500 mt-2">Discover the best cafes in Bali</p>
      </div>
      
      {/* Search bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search cafes..."
          className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Cafes list */}
      {!isLoading && (
        <div className="space-y-2">
          {filteredCafes.map(cafe => (
            <div key={cafe.placeId} onClick={() => setSelectedCafe(cafe)}>
              <CafeCard {...cafe} />
            </div>
          ))}
          
          {filteredCafes.length === 0 && !isLoading && (
            <div className="text-center py-10">
              <p className="text-gray-500">No cafes found</p>
            </div>
          )}
        </div>
      )}
      
      {/* Add Cafe Button (Floating) */}
      <button 
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors"
        onClick={() => setIsAddingCafe(true)}
      >
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
      
      {/* Cafe Detail Modal */}
      <Dialog open={!!selectedCafe} onOpenChange={(open) => !open && setSelectedCafe(null)}>
        <DialogContent className="sm:max-w-md p-0 border-0 bg-transparent shadow-lg overflow-hidden max-h-[90vh]">
          {selectedCafe && (
            <>
              <DialogTitle className="sr-only">{selectedCafe.name}</DialogTitle>
              <CafeDetail 
                cafe={selectedCafe} 
                onClose={() => setSelectedCafe(null)} 
              />
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Add Cafe Modal */}
      <Dialog open={isAddingCafe} onOpenChange={setIsAddingCafe}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle className="sr-only">Add New Cafe</DialogTitle>
          <CafeForm
            onClose={() => setIsAddingCafe(false)}
            onSubmit={handleAddCafe}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
