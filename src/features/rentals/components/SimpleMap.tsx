import React from 'react';
import { MapPin } from 'lucide-react';

interface SimpleMapProps {
  address: string;
  className?: string;
}

const SimpleMap: React.FC<SimpleMapProps> = ({ address, className = '' }) => {
  const handleMapClick = () => {
    // Open in Google Maps
    const encodedAddress = encodeURIComponent(address);
    const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    window.open(url, '_blank');
  };

  return (
    <div 
      className={`bg-gray-100 rounded-lg h-48 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors ${className}`}
      onClick={handleMapClick}
    >
      <div className="text-center text-gray-500">
        <MapPin className="w-8 h-8 mx-auto mb-2" />
        <p className="text-sm font-medium">View on Google Maps</p>
        <p className="text-xs mt-1">Click to open location</p>
      </div>
    </div>
  );
};

export default SimpleMap; 