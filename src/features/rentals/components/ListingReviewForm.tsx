import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  DollarSign, 
  Home, 
  MapPin, 
  Upload, 
  X, 
  Plus,
  Check,
  Edit3,
  ArrowLeft
} from "lucide-react";
import { AnalyzeSourceResponse } from '@/services/listingService';

interface ListingReviewFormProps {
  aiData: AnalyzeSourceResponse['data'];
  onPublish: (listingData: ListingFormData) => void;
  onGoBack: () => void;
  isPublishing: boolean;
}

interface ListingFormData {
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

const ListingReviewForm: React.FC<ListingReviewFormProps> = ({ 
  aiData, 
  onPublish, 
  onGoBack, 
  isPublishing 
}) => {
  const [formData, setFormData] = useState<ListingFormData>({
    title: aiData.extractedListing.title,
    monthlyRent: aiData.extractedListing.monthlyRent,
    currency: aiData.extractedListing.currency,
    deposit: aiData.extractedListing.deposit,
    utilities: aiData.extractedListing.utilities,
    bedrooms: aiData.extractedListing.bedrooms,
    bathrooms: aiData.extractedListing.bathrooms,
    squareFootage: aiData.extractedListing.squareFootage,
    furnished: aiData.extractedListing.furnished,
    petFriendly: aiData.extractedListing.petFriendly,
    smokingAllowed: aiData.extractedListing.smokingAllowed,
    address: aiData.extractedListing.address,
    availableFrom: aiData.extractedListing.availableFrom,
    minimumStay: aiData.extractedListing.minimumStay,
    description: aiData.extractedListing.description,
    amenities: [...aiData.extractedListing.amenities],
    photos: []
  });

  const [newAmenity, setNewAmenity] = useState('');
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);

  const handleInputChange = (field: keyof ListingFormData, value: any) => {
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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, ...files]
      }));

      // Create preview URLs
      const newPreviewUrls = files.map(file => URL.createObjectURL(file));
      setPhotoPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
    
    // Clean up preview URL
    URL.revokeObjectURL(photoPreviewUrls[index]);
    setPhotoPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPublish(formData);
  };

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      photoPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onGoBack}
                disabled={isPublishing}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <Edit3 className="w-6 h-6 text-green-600" />
                  Review & Publish Listing
                </CardTitle>
                <CardDescription>
                  Review the AI-extracted information and make any necessary adjustments
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Check className="w-3 h-3 mr-1" />
              AI Processed
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="title">Property Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter property title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  min="0"
                  value={formData.bedrooms}
                  onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value) || 0)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.bathrooms}
                  onChange={(e) => handleInputChange('bathrooms', parseFloat(e.target.value) || 0)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="squareFootage">Square Footage (Optional)</Label>
                <Input
                  id="squareFootage"
                  type="number"
                  min="0"
                  value={formData.squareFootage || ''}
                  onChange={(e) => handleInputChange('squareFootage', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="e.g., 850"
                />
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="furnished"
                    checked={formData.furnished}
                    onCheckedChange={(checked) => handleInputChange('furnished', checked)}
                  />
                  <Label htmlFor="furnished">Furnished</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="petFriendly"
                    checked={formData.petFriendly}
                    onCheckedChange={(checked) => handleInputChange('petFriendly', checked)}
                  />
                  <Label htmlFor="petFriendly">Pet Friendly</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="smokingAllowed"
                    checked={formData.smokingAllowed}
                    onCheckedChange={(checked) => handleInputChange('smokingAllowed', checked)}
                  />
                  <Label htmlFor="smokingAllowed">Smoking Allowed</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Pricing Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="monthlyRent">Monthly Rent</Label>
                <div className="flex">
                  <select
                    value={formData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    className="px-3 py-2 border border-r-0 rounded-l-md bg-gray-50 text-sm"
                  >
                    <option value="SGD">SGD</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                  <Input
                    id="monthlyRent"
                    type="number"
                    min="0"
                    value={formData.monthlyRent}
                    onChange={(e) => handleInputChange('monthlyRent', parseInt(e.target.value) || 0)}
                    className="rounded-l-none"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="deposit">Security Deposit</Label>
                <Input
                  id="deposit"
                  type="number"
                  min="0"
                  value={formData.deposit}
                  onChange={(e) => handleInputChange('deposit', parseInt(e.target.value) || 0)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="utilities">Utilities (per month)</Label>
                <Input
                  id="utilities"
                  type="number"
                  min="0"
                  value={formData.utilities}
                  onChange={(e) => handleInputChange('utilities', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location & Availability */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location & Availability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter full address"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="availableFrom">Available From</Label>
                <Input
                  id="availableFrom"
                  type="date"
                  value={formData.availableFrom}
                  onChange={(e) => handleInputChange('availableFrom', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="minimumStay">Minimum Stay (months)</Label>
                <Input
                  id="minimumStay"
                  type="number"
                  min="1"
                  value={formData.minimumStay}
                  onChange={(e) => handleInputChange('minimumStay', parseInt(e.target.value) || 1)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Detailed description of the property"
              className="min-h-[120px]"
              required
            />
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card>
          <CardHeader>
            <CardTitle>Amenities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {formData.amenities.map((amenity, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {amenity}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-red-500"
                    onClick={() => handleRemoveAmenity(amenity)}
                  />
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                placeholder="Add new amenity"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAmenity())}
              />
              <Button type="button" onClick={handleAddAmenity} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Photo Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Property Photos
            </CardTitle>
            <CardDescription>
              Upload high-quality photos of your property (recommended: 5-10 photos)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {photoPreviewUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Property photo ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemovePhoto(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>

            <div>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              <Label
                htmlFor="photo-upload"
                className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
              >
                <div className="text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">Click to upload photos</p>
                  <p className="text-xs text-gray-400">JPEG, PNG up to 10MB each</p>
                </div>
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Card>
          <CardContent className="pt-6">
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isPublishing}
            >
              {isPublishing ? (
                <>
                  <Calendar className="w-5 h-5 mr-2 animate-spin" />
                  Publishing Listing...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Publish Listing
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default ListingReviewForm; 