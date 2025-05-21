import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import CafeCard from '../components/CafeCard';
import { fetchCafes } from '../services/cafeService';
import { type Cafe } from '../types';
import { toast } from "@/hooks/use-toast";
import { addCafeToCache } from '../lib/queryUtils';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu as MenuIcon } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: cafes, isLoading, error } = useQuery({
    queryKey: ['cafes'],
    queryFn: fetchCafes,
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
        phoneNumber: '+62 123 456789',
        priceLevel: 2,
        types: ['cafe', 'restaurant', 'food', 'point_of_interest', 'establishment'],
        region: 'canggu',
        businessStatus: 'OPERATIONAL',
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
        website: 'https://satujalan.coffee',
        phoneNumber: '+62 987 654321',
        priceLevel: 2,
        types: ['cafe', 'restaurant', 'food', 'point_of_interest', 'establishment'],
        region: 'canggu',
        businessStatus: 'OPERATIONAL',
      }
    ]
  });
  
  useEffect(() => {
    if (Array.isArray(cafes) && cafes.length > 0) {
      cafes.forEach(cafe => {
        if (cafe && cafe.placeId) {
          addCafeToCache(queryClient, cafe);
        }
      });
    }
  }, [cafes, queryClient]);
  
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
  
  const filteredCafes = (Array.isArray(cafes) && cafes.length > 0)
    ? cafes
        .filter(cafe => 
          cafe && cafe.name && typeof cafe.name === 'string' && 
          cafe.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
          if (a.isOpenNow && !b.isOpenNow) return -1;
          if (!a.isOpenNow && b.isOpenNow) return 1;
          return 0;
        })
    : [];

  const handleCafeCardClick = (cafe: Cafe) => {
    addCafeToCache(queryClient, cafe);
    navigate(`/cafe/${cafe.placeId}`, { state: { cafeData: cafe } });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Sticky Wrapper Div */}
      <div className="sticky top-0 z-50 bg-gray-50 pb-4 px-4">
        {/* HeaderContentDiv */}
        <div className="pt-6 pb-2">
          <div className="relative flex items-center justify-center">
            {/* Spacer for balance, adjust width/visibility as needed if button width is dynamic */}
            <div className="absolute left-0 h-full flex items-center">
              {/* This spacer can be made invisible or hold other icons if needed */}
            </div>

            <h1 className="text-3xl font-bold text-black">Baliciaga</h1>

            <div className="absolute right-0 h-full flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-black hover:bg-gray-200">
                    <MenuIcon className="h-6 w-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    className="flex justify-center" 
                    onSelect={() => { window.location.href = 'mailto:yo@baliciaga.com'; }}
                  >
                    Contact
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        <p className="text-center text-gray-500 mt-1">Discover the best cafes in Bali</p>
      </div>
      
        {/* SearchBarDiv */}
        <div className="">
        <input
          type="text"
          placeholder="Search cafes..."
          className="w-full px-3 py-[0.45rem] rounded-lg border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        </div>
      </div>
      
      {isLoading && (
        <div className="flex justify-center items-center py-20 px-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {!isLoading && (
        <div className="space-y-2 px-4">
          {filteredCafes.map(cafe => (
            <div key={cafe.placeId} onClick={() => handleCafeCardClick(cafe)}>
              <CafeCard cafe={cafe} />
            </div>
          ))}
          
          {filteredCafes.length === 0 && !isLoading && (
            <div className="text-center py-10">
              <p className="text-gray-500">No cafes found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Index;
