import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type Cafe } from '../services/cafeService';

interface CafeFormProps {
  onClose: () => void;
  onSubmit: (cafeData: Cafe) => void;
}

const CafeForm: React.FC<CafeFormProps> = ({ onClose, onSubmit }) => {
  const [cafeData, setCafeData] = useState({
    name: '',
    address: '',
    phoneNumber: '',
    website: '',
    openingHours: ['', '', '', '', '', '', ''],
    priceLevel: 1,
    isOpenNow: true,
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCafeData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleHoursChange = (index: number, value: string) => {
    const newHours = [...cafeData.openingHours];
    newHours[index] = `${days[index]}: ${value}`;
    setCafeData(prev => ({
      ...prev,
      openingHours: newHours
    }));
  };

  const handlePriceLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCafeData(prev => ({
      ...prev,
      priceLevel: parseInt(e.target.value)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate creating new cafe data
    onSubmit({
      ...cafeData,
      placeId: `new-cafe-${Date.now()}`,
      latitude: -8.650000 + Math.random() * 0.01,
      longitude: 115.130000 + Math.random() * 0.01,
      photos: ['https://via.placeholder.com/400x300?text=New+Cafe'],
      rating: 5.0,
      userRatingsTotal: 0,
      types: ['cafe', 'food', 'point_of_interest', 'establishment'],
    } as Cafe);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Add New Cafe</h2>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Cafe Name</Label>
            <Input
              id="name"
              name="name"
              value={cafeData.name}
              onChange={handleChange}
              placeholder="Enter cafe name"
              required
            />
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              value={cafeData.address}
              onChange={handleChange}
              placeholder="Enter address"
              required
            />
          </div>

          <div>
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              value={cafeData.phoneNumber}
              onChange={handleChange}
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              value={cafeData.website}
              onChange={handleChange}
              placeholder="Enter website URL"
            />
          </div>

          <div>
            <Label>Price Level</Label>
            <select 
              value={cafeData.priceLevel}
              onChange={handlePriceLevelChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="-1">Unknown</option>
              <option value="1">₨ (Budget)</option>
              <option value="2">₨₨ (Moderate)</option>
              <option value="3">₨₨₨ (Expensive)</option>
              <option value="4">₨₨₨₨ (Very Expensive)</option>
            </select>
          </div>

          <div>
            <Label>Opening Hours</Label>
            <div className="space-y-2 mt-2">
              {days.map((day, index) => (
                <div key={day} className="flex items-center">
                  <span className="w-24 text-sm">{day}</span>
                  <Input
                    placeholder={`${day} hours (e.g. 8:00 AM - 5:00 PM)`}
                    onChange={(e) => handleHoursChange(index, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="flex-1">Add Cafe</Button>
            <Button type="button" onClick={onClose} className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300">
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CafeForm;
