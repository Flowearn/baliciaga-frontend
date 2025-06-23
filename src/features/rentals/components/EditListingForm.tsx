import React, { useState, useEffect, useCallback } from 'react';
import { MyListing, updateListing } from '@/services/listingService';
import { uploadListingPhotos } from '@/services/uploadService';
import { formatPrice } from '@/lib/utils';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { 
  X,
  UploadCloud,
  Loader2
} from 'lucide-react';

interface EditListingFormProps {
  listing: MyListing;
  onUpdateSuccess: () => void;
}

interface EditFormData {
  title: string;
  monthlyRent: number | string;
  yearlyRent: number | string | null;
  currency: string;
  deposit: number | string;
  utilities: number | string;
  bedrooms: number | string;
  bathrooms: number | string;
  squareFootage: number | string | null;
  furnished: boolean;
  petFriendly: boolean;
  smokingAllowed: boolean;
  address: string;
  availableFrom: string;
  minimumStay: number | string;
  amenities: string[];
  photos: string[]; // URL strings of uploaded photos
}

const EditListingForm: React.FC<EditListingFormProps> = ({ listing, onUpdateSuccess }) => {
  // Safe amenities processing - handle string, array, or null/undefined
  const safeAmenities: string[] = Array.isArray(listing.amenities)
    ? listing.amenities
    : typeof listing.amenities === 'string' && (listing.amenities as string).length > 0
      ? (listing.amenities as string).split(',').map((s) => s.trim()).filter(Boolean)
      : [];

  console.log('EditListingForm - listing.amenities type:', typeof listing.amenities);
  console.log('EditListingForm - listing.amenities value:', listing.amenities);
  console.log('EditListingForm - safeAmenities:', safeAmenities);

  const [formData, setFormData] = useState<EditFormData>({
    title: listing.title,
    monthlyRent: listing.pricing.monthlyRent,
    yearlyRent: listing.pricing.yearlyRent || null,
    currency: listing.pricing.currency,
    deposit: listing.pricing.deposit,
    utilities: listing.pricing.utilities,
    bedrooms: listing.details.bedrooms,
    bathrooms: listing.details.bathrooms,
    squareFootage: listing.details.squareFootage,
    furnished: listing.details.furnished,
    petFriendly: listing.details.petFriendly,
    smokingAllowed: listing.details.smokingAllowed,
    address: listing.location.address,
    availableFrom: listing.availability.availableFrom,
    minimumStay: listing.availability.minimumStay,
    amenities: safeAmenities,
    photos: listing.photos || [] // 现有照片URL
  });

  const [newAmenity, setNewAmenity] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Handle photo upload with dropzone
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.slice(0, 10 - formData.photos.length); // Limit to 10 total photos
    
    if (newFiles.length === 0) {
      toast.error('Maximum 10 photos allowed');
      return;
    }

    console.log('Uploading files:', newFiles.map(f => ({ name: f.name, size: f.size, type: f.type })));

    try {
      setIsUploading(true);
      const newPhotoUrls = await uploadListingPhotos(newFiles);
      
      console.log('Upload successful, new URLs:', newPhotoUrls);
      
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, ...newPhotoUrls]
      }));
      
      toast.success(`Uploaded ${newPhotoUrls.length} photo(s) successfully!`);
    } catch (error: any) {
      console.error('Photo upload error:', error);
      const errorMessage = error?.response?.data?.error?.message || error?.message || 'Failed to upload photos';
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  }, [formData.photos.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 10,
    disabled: formData.photos.length >= 10 || isUploading
  });

  // Remove photo
  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
    toast.success('Photo removed');
  };

  const handleInputChange = (field: keyof EditFormData, value: string | number | boolean | string[] | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()]
      }));
      setNewAmenity('');
    }
  };

  const handleRemoveAmenity = (amenityToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(amenity => amenity !== amenityToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Photo validation: at least one photo is required
    if (!formData.photos || formData.photos.length === 0) {
      toast.error('At least one photo is required');
      return;
    }
    
    setIsUpdating(true);

    try {
      // Prepare payload - convert amenities array back to string for backend compatibility
      const payload = {
        ...formData,
        // Convert string/number fields to numbers for API
        monthlyRent: typeof formData.monthlyRent === 'string' ? Number(formData.monthlyRent) || 0 : formData.monthlyRent,
        yearlyRent: formData.yearlyRent === null || formData.yearlyRent === '' ? null : (typeof formData.yearlyRent === 'string' ? Number(formData.yearlyRent) : formData.yearlyRent),
        deposit: typeof formData.deposit === 'string' ? Number(formData.deposit) || 0 : formData.deposit,
        utilities: typeof formData.utilities === 'string' ? Number(formData.utilities) || 0 : formData.utilities,
        bedrooms: typeof formData.bedrooms === 'string' ? Number(formData.bedrooms) || 0 : formData.bedrooms,
        bathrooms: typeof formData.bathrooms === 'string' ? Number(formData.bathrooms) || 0 : formData.bathrooms,
        squareFootage: typeof formData.squareFootage === 'string' ? (formData.squareFootage === '' ? null : Number(formData.squareFootage)) : formData.squareFootage,
        minimumStay: typeof formData.minimumStay === 'string' ? Number(formData.minimumStay) || 1 : formData.minimumStay,
        amenities: formData.amenities.join(','), // Convert array to comma-separated string
        photos: formData.photos // Include photos array
      };

      console.log('Updating listing with data:', payload);
      console.log('Original amenities array:', formData.amenities);
      console.log('Converted amenities string:', payload.amenities);
      
      const response = await updateListing(listing.listingId, payload);
      
      if (response.success) {
        toast.success('Listing updated successfully!');
        onUpdateSuccess();
      } else {
        throw new Error(response.error?.message || 'Failed to update listing');
      }
    } catch (error) {
      console.error('Error updating listing:', error);
      toast.error('Failed to update listing');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6 pb-8">
      
      {/* Property Photos Section */}
      <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 shadow-md text-white/90">
        <h2 className="text-xl font-bold text-white mb-4">Property Photos <span className="text-red-500">*</span></h2>
        
        {/* Upload Area */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-white/60 bg-white/20'
              : 'border-white/30 bg-white/10 hover:border-white/50 hover:bg-white/15'
          } ${formData.photos.length >= 10 || isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <UploadCloud className="h-8 w-8 mx-auto mb-2 text-white/70" />
          {isUploading ? (
            <p className="text-white/70">Uploading...</p>
          ) : isDragActive ? (
            <p className="text-white/70">Drop the files here...</p>
          ) : (
            <div>
              <p className="text-white/70">
                {formData.photos.length >= 10 
                  ? 'Maximum 10 photos reached' 
                  : `Drag & drop photos here, or click to select (${formData.photos.length}/10)`
                }
              </p>
              <p className="text-white/50 text-base mt-1">
                Supports JPEG, PNG, WebP
              </p>
            </div>
          )}
          {isUploading && (
            <Loader2 className="h-5 w-5 mx-auto mt-2 animate-spin text-white/70" />
          )}
        </div>

        {/* Photo Previews */}
        {formData.photos.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              Current Photos ({formData.photos.length}/10)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {formData.photos.map((photoUrl, index) => (
                <div key={index} className="relative group">
                  <OptimizedImage
                    src={photoUrl}
                    alt={`Photo ${index + 1}`}
                    aspectRatio="1:1"
                    priority={false}
                    className="rounded-lg border border-white/20"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-80 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md"
                    data-testid={`remove-photo-${index}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Photo validation error message */}
        {formData.photos.length === 0 && (
          <p className="text-red-400 text-base mt-2">At least one photo is required.</p>
        )}
      </div>

      {/* Property Details Section */}
      <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 shadow-md text-white/90 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">Property Details</h2>
        
        {/* Property Title */}
        <div className="mb-4">
          <label htmlFor="title" className="block text-base font-medium text-white/90 mb-2">
            Property Title
          </label>
          <input
            id="title"
            type="text"
            className="w-full h-10 py-2 px-3 bg-white/10 focus:bg-white/20 placeholder-white/20 text-white text-base border border-white/20 focus:border-white/40 rounded-lg focus:outline-none"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="e.g., Beautiful Villa in Canggu"
          />
        </div>

        {/* Address */}
        <div className="mb-4">
          <label htmlFor="address" className="block text-base font-medium text-white/90 mb-2">
            Address
          </label>
          <input
            id="address"
            type="text"
            className="w-full h-10 py-2 px-3 bg-white/10 focus:bg-white/20 placeholder-white/20 text-white text-base border border-white/20 focus:border-white/40 rounded-lg focus:outline-none"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Property address"
          />
        </div>

        {/* Bedrooms / Bathrooms */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="bedrooms" className="block text-base font-medium text-white/90 mb-2">
              Bedrooms
            </label>
            <input
              id="bedrooms"
              type="number"
              min="0"
              className="w-full h-10 py-2 px-3 bg-white/10 focus:bg-white/20 placeholder-white/20 text-white text-base border border-white/20 focus:border-white/40 rounded-lg focus:outline-none"
              value={formData.bedrooms || ''}
              onChange={(e) => handleInputChange('bedrooms', e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
            />
          </div>
          <div>
            <label htmlFor="bathrooms" className="block text-base font-medium text-white/90 mb-2">
              Bathrooms
            </label>
            <input
              id="bathrooms"
              type="number"
              min="0"
              className="w-full h-10 py-2 px-3 bg-white/10 focus:bg-white/20 placeholder-white/20 text-white text-base border border-white/20 focus:border-white/40 rounded-lg focus:outline-none"
              value={formData.bathrooms || ''}
              onChange={(e) => handleInputChange('bathrooms', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        {/* Square Feet / Min Stay */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="squareFootage" className="block text-base font-medium text-white/90 mb-2">
              Square Feet
            </label>
            <input
              id="squareFootage"
              type="number"
              min="0"
              className="w-full h-10 py-2 px-3 bg-white/10 focus:bg-white/20 placeholder-white/20 text-white text-base border border-white/20 focus:border-white/40 rounded-lg focus:outline-none"
              value={formData.squareFootage || ''}
              onChange={(e) => handleInputChange('squareFootage', e.target.value ? parseInt(e.target.value) : null)}
              placeholder="Square footage"
            />
          </div>
          <div>
            <label htmlFor="minimumStay" className="block text-base font-medium text-white/90 mb-2">
              Min Stay (months)
            </label>
            <input
              id="minimumStay"
              type="number"
              min="1"
              className="w-full h-10 py-2 px-3 bg-white/10 focus:bg-white/20 placeholder-white/20 text-white text-base border border-white/20 focus:border-white/40 rounded-lg focus:outline-none"
              value={formData.minimumStay || ''}
              onChange={(e) => handleInputChange('minimumStay', e.target.value === '' ? '' : parseInt(e.target.value) || 1)}
            />
          </div>
        </div>

        {/* Monthly Rent with Currency */}
        <div className="mb-4">
          <label className="block text-base font-medium text-white/90 mb-2">
            Monthly Rent
          </label>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <input
                id="monthlyRent"
                type="number"
                min="0"
                className="w-full h-10 py-2 px-3 bg-white/10 focus:bg-white/20 placeholder:text-white/20 text-white text-base border border-white/20 focus:border-white/40 rounded-lg focus:outline-none"
                value={formData.monthlyRent || ''}
                onChange={(e) => handleInputChange('monthlyRent', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                placeholder="Monthly rent amount"
              />
            </div>
            <div>
              <select
                value={formData.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                className="block w-full h-10 rounded-lg bg-white/10 pl-3 pr-3 py-2 text-white/90 text-base placeholder-white/20 focus:outline-none appearance-none bg-no-repeat bg-right"
                style={{ 
                  backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                  backgroundPosition: "right 8px center",
                  backgroundSize: "16px 16px"
                }}
              >
                <option value="IDR">IDR</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
        </div>

        {/* Yearly Rent */}
        <div className="mb-6">
          <label className="block text-base font-medium text-white/90 mb-2">
            Yearly Rent (Optional)
          </label>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <input
                id="yearlyRent"
                type="number"
                min="0"
                className="w-full h-10 py-2 px-3 bg-white/10 focus:bg-white/20 placeholder:text-white/20 text-white text-base border border-white/20 focus:border-white/40 rounded-lg focus:outline-none"
                value={formData.yearlyRent || ''}
                onChange={(e) => handleInputChange('yearlyRent', e.target.value === '' ? null : parseFloat(e.target.value) || null)}
                placeholder="Yearly rent amount"
              />
            </div>
            <div>
              <select
                value={formData.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                className="block w-full h-10 rounded-lg bg-white/10 pl-3 pr-3 py-2 text-white/90 text-base placeholder-white/20 focus:outline-none appearance-none bg-no-repeat bg-right"
                style={{ 
                  backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                  backgroundPosition: "right 8px center",
                  backgroundSize: "16px 16px"
                }}
              >
                <option value="IDR">IDR</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
          {/* Monthly Equivalent Display */}
          {formData.yearlyRent && parseFloat(formData.yearlyRent.toString()) > 0 && (
            <p className="text-sm text-white/60 mt-1">
              (equivalent monthly = {formatPrice(
                Math.round(parseFloat(formData.yearlyRent.toString()) / 12),
                formData.currency
              )})
            </p>
          )}
        </div>

        {/* Deposit and Utilities */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="deposit" className="block text-base font-medium text-white/90 mb-2">
              Deposit
            </label>
            <input
              id="deposit"
              type="number"
              min="0"
              className="w-full h-10 py-2 px-3 bg-white/10 focus:bg-white/20 placeholder-white/20 text-white text-base border border-white/20 focus:border-white/40 rounded-lg focus:outline-none"
              value={formData.deposit || ''}
              onChange={(e) => handleInputChange('deposit', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
              placeholder="Deposit amount"
            />
          </div>
          <div>
            <label htmlFor="utilities" className="block text-base font-medium text-white/90 mb-2">
              Utilities
            </label>
            <input
              id="utilities"
              type="number"
              min="0"
              className="w-full h-10 py-2 px-3 bg-white/10 focus:bg-white/20 placeholder-white/20 text-white text-base border border-white/20 focus:border-white/40 rounded-lg focus:outline-none"
              value={formData.utilities || ''}
              onChange={(e) => handleInputChange('utilities', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
              placeholder="Utilities cost"
            />
          </div>
        </div>

      </div>

      {/* Amenities Display Section */}
      <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 shadow-md text-white/90 mb-6">
        <h3 className="text-xl font-semibold text-white mb-4">Amenities</h3>
        {formData.amenities.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {formData.amenities.map((amenity, index) => (
              <div key={index} className="px-3 py-1 bg-white/20 text-white rounded-full text-base flex items-center gap-2">
                {amenity}
                <button
                  type="button"
                  onClick={() => handleRemoveAmenity(amenity)}
                  className="text-white/70 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white/70 text-base">No amenities selected yet. Use the buttons above to add amenities.</p>
        )}
      </div>

      {/* Update Button */}
      <button
        type="submit"
        disabled={isUpdating}
        className="w-full bg-[#2563eb] text-white font-semibold rounded-xl py-3 mt-6 sticky bottom-20 shadow-lg transition-colors"
      >
        {isUpdating ? 'Updating...' : 'Update Listing'}
      </button>
    </form>
  );
};

export default EditListingForm; 