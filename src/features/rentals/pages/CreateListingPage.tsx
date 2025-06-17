import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Upload, Sparkles, Plus, UploadCloud, User, Building, Home as HomeIcon, Menu as MenuIcon } from 'lucide-react';
import { analyzeListingSource, AnalyzeSourceResponse, createListing } from '@/services/listingService';
import { uploadListingPhotos } from '@/services/uploadService';
import ColoredPageWrapper from '@/components/layout/ColoredPageWrapper';

interface ListingFormData {
  title: string;
  monthlyRent: number | string;
  currency: string;
  deposit: number;
  utilities: number;
  bedrooms: number | string;
  bathrooms: number | string;
  squareFootage: number | string | null;
  furnished: boolean;
  petFriendly: boolean;
  smokingAllowed: boolean;
  address: string;
  locationArea: string;
  availableFrom: string;
  minimumStay: number | string;
  description: string;
  amenities: string[];
  photos: File[];
}

// Custom hook for auto-resizing textarea
const useAutoResizeTextarea = (value: string) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return textareaRef;
};

const CreateListingPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Poster role state
  const [posterRole, setPosterRole] = useState<'tenant' | 'landlord' | null>(null);

  // Handle back navigation
  const handleBack = () => {
    navigate('/');
  };
  
  // Form state
  const [formData, setFormData] = useState<ListingFormData>({
    title: '',
    monthlyRent: 0,
    currency: 'IDR',
    deposit: 0,
    utilities: 0,
    bedrooms: 0,
    bathrooms: 0,
    squareFootage: null,
    furnished: false,
    petFriendly: false,
    smokingAllowed: false,
    address: '',
    locationArea: '',
    availableFrom: '',
    minimumStay: 1,
    description: '',
    amenities: [],
    photos: []
  });

  // AI analysis state
  const [aiInput, setAiInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [newAmenity, setNewAmenity] = useState('');

  // Photo preview state
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  // Auto-resize textarea ref
  const textareaRef = useAutoResizeTextarea(aiInput);

  // Handle photo upload with dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.slice(0, 10 - formData.photos.length); // Limit to 10 total photos
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...newFiles]
    }));

    // Create preview URLs
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setPhotoPreviews(prev => [...prev, ...newPreviews]);
  }, [formData.photos.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 10,
    disabled: formData.photos.length >= 10
  });

  // Remove photo
  const removePhoto = (index: number) => {
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(photoPreviews[index]);
    
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Handle AI analysis
  const handleAnalyzeSource = async () => {
    if (!aiInput.trim()) {
      toast.error('Please enter some text to analyze');
      return;
    }

    try {
      setIsAnalyzing(true);
      
      const response = await analyzeListingSource(aiInput);
      
      if (response.success && response.data) {
        const extracted = response.data.extractedListing;
        setFormData(prev => ({
          ...prev,
          title: extracted.title || prev.title,
          monthlyRent: extracted.monthlyRent || prev.monthlyRent,
          currency: extracted.currency || prev.currency,
          deposit: extracted.deposit || prev.deposit,
          utilities: extracted.utilities || prev.utilities,
          bedrooms: extracted.bedrooms || prev.bedrooms,
          bathrooms: extracted.bathrooms || prev.bathrooms,
          squareFootage: extracted.squareFootage || prev.squareFootage,
          furnished: extracted.furnished,
          petFriendly: extracted.petFriendly,
          smokingAllowed: extracted.smokingAllowed,
          address: extracted.address || prev.address,
          locationArea: extracted.locationArea || prev.locationArea,
          availableFrom: extracted.availableFrom || prev.availableFrom,
          minimumStay: extracted.minimumStay || prev.minimumStay,
          description: extracted.description || prev.description,
          amenities: extracted.amenities.length > 0 ? extracted.amenities : prev.amenities,
        }));
        
        toast.success('AI analysis completed!', {
          description: 'Form fields have been filled automatically. You can review and modify them.'
        });
      } else {
        throw new Error(response.error?.message || 'Analysis failed');
      }
    } catch (error: unknown) {
      console.error('AI analysis error:', error);
      toast.error('AI analysis failed', {
        description: 'Please fill out the form manually or try again with different text.'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle form field changes
  const handleInputChange = (field: keyof ListingFormData, value: string | number | boolean | string[] | File[] | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle number input changes with proper empty value handling
  const handleNumberInputChange = (field: keyof ListingFormData, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 关键修复：如果输入为空，则将值设为空字符串，否则才转换为数字
    const numericValue = value === '' ? '' : Number(value);
    setFormData(prev => ({ ...prev, [field]: numericValue }));
  };

  // Handle amenity management
  const addAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()]
      }));
      setNewAmenity('');
    }
  };

  const removeAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenity)
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Convert string values to numbers for validation and submission
    const monthlyRent = typeof formData.monthlyRent === 'string' ? Number(formData.monthlyRent) || 0 : formData.monthlyRent;
    const bedrooms = typeof formData.bedrooms === 'string' ? Number(formData.bedrooms) || 0 : formData.bedrooms;
    const bathrooms = typeof formData.bathrooms === 'string' ? Number(formData.bathrooms) || 0 : formData.bathrooms;
    const minimumStay = typeof formData.minimumStay === 'string' ? Number(formData.minimumStay) || 1 : formData.minimumStay;
    const squareFootage = typeof formData.squareFootage === 'string' ? (formData.squareFootage === '' ? null : Number(formData.squareFootage)) : formData.squareFootage;

    // Basic validation
    if (!formData.title || !formData.address || monthlyRent <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Poster role validation
    if (!posterRole) {
      toast.error('Please select whether you are a tenant or landlord');
      return;
    }

    try {
      setIsPublishing(true);

      // 先上传图片获取URL（这里使用临时实现）
      const photoUrls = await uploadListingPhotos(formData.photos);

      const response = await createListing({
        title: formData.title,
        posterRole: posterRole,
        monthlyRent: monthlyRent,
        currency: formData.currency,
        deposit: formData.deposit,
        utilities: formData.utilities,
        bedrooms: bedrooms,
        bathrooms: bathrooms,
        squareFootage: squareFootage,
        furnished: formData.furnished,
        petFriendly: formData.petFriendly,
        smokingAllowed: formData.smokingAllowed,
        address: formData.address,
        locationArea: formData.locationArea,
        availableFrom: formData.availableFrom,
        minimumStay: minimumStay,
        description: formData.description,
        amenities: formData.amenities,
        photos: photoUrls // 修复：传递实际的图片URL数组而不是空数组
      });
      
      if (response.success && response.data) {
        toast.success('Listing published successfully!');
        navigate(`/listings/${response.data.listingId}`);
      } else {
        throw new Error(response.error?.message || 'Failed to publish listing');
      }
    } catch (error: unknown) {
      console.error('Publish listing error:', error);
      toast.error('Failed to publish listing', {
        description: 'Please try again or contact support.'
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <ColoredPageWrapper seed="create-listing">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 px-4 py-3 flex items-center justify-between" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
        <Button variant="ghost" size="icon" onClick={handleBack} className="text-white hover:bg-white/20">
          <HomeIcon className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold text-white">Publish Listing</h1>
        <div className="w-10" /> {/* Spacer for centering */}
      </header>

      <div className="max-w-2xl mx-auto space-y-6 px-4 py-6">
        
        {/* Image Upload Section */}
        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 shadow-md text-white/90">
                      <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Property Photos</h2>
              <div className="flex items-center gap-3">
                {formData.photos.length > 0 && (
                  <span className="text-sm text-white/70">
                    {formData.photos.length}/10 photos
                  </span>
                )}
                <Button
                  {...getRootProps()}
                  className={`bg-white/20 text-white hover:bg-white/30 rounded-full px-3 h-8 text-sm ${
                    formData.photos.length >= 10 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={formData.photos.length >= 10}
                >
                  <input {...getInputProps()} />
                  <UploadCloud className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
            </div>

                      {/* Photo Previews */}
            {photoPreviews.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Uploaded Photos ({photoPreviews.length}/10)
                </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {photoPreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-auto rounded-lg border"
                    />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* A. AI 提取区域 */}
        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 shadow-md text-white/90">
                      <div className="space-y-4">
              <Textarea
                ref={textareaRef}
                className="w-full min-h-[80px] resize-none bg-white/10 focus:bg-white/20 placeholder:text-white/20 text-white border-white/20 focus:border-white/40"
                placeholder="Paste the property description here, e.g. URL or details..."
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleAnalyzeSource}
                  disabled={isAnalyzing || !aiInput.trim()}
                  className="bg-white/20 text-white hover:bg-white/30 rounded-full px-4 h-8 text-sm"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {isAnalyzing ? 'Analyzing...' : 'Extract with AI'}
                </Button>
              </div>
            </div>
        </div>

        {/* B. "Property Details" 表单区域 */}
        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 shadow-md text-white/90 mb-6">
          <h2 className="text-2xl font-bold text-white mb-6">Property Details</h2>
          
          {/* Poster Role Selection */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setPosterRole('tenant')}
                className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-3 ${
                  posterRole === 'tenant'
                    ? 'border-white/60 bg-white/20 text-white'
                    : 'border-white/20 bg-white/10 text-white/70 hover:border-white/40'
                }`}
              >
                <User className="h-8 w-8" />
                <span className="font-medium">Tenant</span>
              </button>
              <button
                onClick={() => setPosterRole('landlord')}
                className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-3 ${
                  posterRole === 'landlord'
                    ? 'border-white/60 bg-white/20 text-white'
                    : 'border-white/20 bg-white/10 text-white/70 hover:border-white/40'
                }`}
              >
                <Building className="h-8 w-8" />
                <span className="font-medium">Landlord/Agent</span>
              </button>
            </div>
          </div>
          
          {/* Property Title */}
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-white/90 mb-2">
              Property Title
            </label>
            <input
              id="title"
              type="text"
              className="w-full p-3 bg-white/10 focus:bg-white/20 placeholder-white/20 text-white border border-white/20 focus:border-white/40 rounded-lg focus:outline-none"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Beautiful Villa in Canggu"
            />
          </div>

          {/* Address */}
          <div className="mb-4">
            <label htmlFor="address" className="block text-sm font-medium text-white/90 mb-2">
              Address
            </label>
            <input
              id="address"
              type="text"
              className="w-full p-3 bg-white/10 focus:bg-white/20 placeholder-white/20 text-white border border-white/20 focus:border-white/40 rounded-lg focus:outline-none"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Property address"
            />
          </div>

          {/* Location Area */}
          <div className="mb-4">
            <label htmlFor="locationArea" className="block text-sm font-medium text-white/90 mb-2">
              Location Area
            </label>
            <input
              id="locationArea"
              type="text"
              className="w-full p-3 bg-white/10 focus:bg-white/20 placeholder-white/20 text-white border border-white/20 focus:border-white/40 rounded-lg focus:outline-none"
              value={formData.locationArea}
              onChange={(e) => handleInputChange('locationArea', e.target.value)}
              placeholder="e.g., Canggu, Ubud, Seminyak"
            />
          </div>

          {/* Bedrooms / Bathrooms */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="bedrooms" className="block text-sm font-medium text-white/90 mb-2">
                Bedrooms
              </label>
              <input
                id="bedrooms"
                type="number"
                min="0"
                className="w-full p-3 bg-white/10 focus:bg-white/20 placeholder-white/20 text-white border border-white/20 focus:border-white/40 rounded-lg focus:outline-none"
                value={formData.bedrooms || ''}
                onChange={(e) => handleNumberInputChange('bedrooms', e)}
              />
            </div>
            <div>
              <label htmlFor="bathrooms" className="block text-sm font-medium text-white/90 mb-2">
                Bathrooms
              </label>
              <input
                id="bathrooms"
                type="number"
                min="0"
                className="w-full p-3 bg-white/10 focus:bg-white/20 placeholder-white/20 text-white border border-white/20 focus:border-white/40 rounded-lg focus:outline-none"
                value={formData.bathrooms || ''}
                onChange={(e) => handleNumberInputChange('bathrooms', e)}
              />
            </div>
          </div>

          {/* Square Feet / Min Stay */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="squareFootage" className="block text-sm font-medium text-white/90 mb-2">
                Square Feet
              </label>
              <input
                id="squareFootage"
                type="number"
                min="0"
                className="w-full p-3 bg-white/10 focus:bg-white/20 placeholder-white/20 text-white border border-white/20 focus:border-white/40 rounded-lg focus:outline-none"
                value={formData.squareFootage || ''}
                onChange={(e) => handleNumberInputChange('squareFootage', e)}
                placeholder="Square footage"
              />
            </div>
            <div>
              <label htmlFor="minimumStay" className="block text-sm font-medium text-white/90 mb-2">
                Min Stay (months)
              </label>
              <input
                id="minimumStay"
                type="number"
                min="1"
                className="w-full p-3 bg-white/10 focus:bg-white/20 placeholder-white/20 text-white border border-white/20 focus:border-white/40 rounded-lg focus:outline-none"
                value={formData.minimumStay || ''}
                onChange={(e) => handleNumberInputChange('minimumStay', e)}
              />
            </div>
          </div>

          {/* Monthly Rent with Currency */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white/90 mb-2">
              Monthly Rent
            </label>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <input
                  id="monthlyRent"
                  type="number"
                  min="0"
                  className="w-full p-3 bg-white/10 focus:bg-white/20 placeholder:text-white/20 text-white border border-white/20 focus:border-white/40 rounded-lg focus:outline-none"
                  value={formData.monthlyRent || ''}
                  onChange={(e) => handleNumberInputChange('monthlyRent', e)}
                  placeholder="Monthly rent amount"
                />
              </div>
              <div>
                <select
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className="block w-full rounded-lg bg-white/10 px-3 py-2 text-white/90 placeholder-white/20 focus:outline-none"
                >
                  <option value="IDR">IDR</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>
          </div>

          {/* Property Description */}
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-white/90 mb-2">
              Property Description
            </label>
            <textarea
              id="description"
              rows={4}
              className="w-full p-3 bg-white/10 focus:bg-white/20 placeholder:text-white/20 text-white border border-white/20 focus:border-white/40 rounded-lg focus:outline-none resize-none"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your property, location highlights, nearby amenities..."
            />
          </div>
        </div>

        {/* C. "Availability" 标签区域 */}
        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 shadow-md text-white/90 mb-6">
          <h3 className="text-xl font-semibold text-white mb-4">Availability</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleInputChange('furnished', !formData.furnished)}
              className={`px-4 py-2 rounded-full border transition-colors ${
                formData.furnished 
                  ? 'bg-white/40 text-white border-white/60' 
                  : 'bg-white/20 text-white border-white/30 hover:border-white/50'
              }`}
            >
              Furnished
            </button>
            <button
              onClick={() => handleInputChange('petFriendly', !formData.petFriendly)}
              className={`px-4 py-2 rounded-full border transition-colors ${
                formData.petFriendly 
                  ? 'bg-white/40 text-white border-white/60' 
                  : 'bg-white/20 text-white border-white/30 hover:border-white/50'
              }`}
            >
              Pet Friendly
            </button>
            <button
              onClick={() => handleInputChange('smokingAllowed', !formData.smokingAllowed)}
              className={`px-4 py-2 rounded-full border transition-colors ${
                formData.smokingAllowed 
                  ? 'bg-white/40 text-white border-white/60' 
                  : 'bg-white/20 text-white border-white/30 hover:border-white/50'
              }`}
            >
              Smoking Allow
            </button>
            <button
              onClick={() => {
                const hasWifi = formData.amenities.includes('WiFi');
                if (hasWifi) {
                  handleInputChange('amenities', formData.amenities.filter(a => a !== 'WiFi'));
                } else {
                  handleInputChange('amenities', [...formData.amenities, 'WiFi']);
                }
              }}
              className={`px-4 py-2 rounded-full border transition-colors ${
                formData.amenities.includes('WiFi') 
                  ? 'bg-white/40 text-white border-white/60' 
                  : 'bg-white/20 text-white border-white/30 hover:border-white/50'
              }`}
            >
              WiFi
            </button>
            <button
              onClick={() => {
                const hasPool = formData.amenities.includes('Pool');
                if (hasPool) {
                  handleInputChange('amenities', formData.amenities.filter(a => a !== 'Pool'));
                } else {
                  handleInputChange('amenities', [...formData.amenities, 'Pool']);
                }
              }}
              className={`px-4 py-2 rounded-full border transition-colors ${
                formData.amenities.includes('Pool') 
                  ? 'bg-white/40 text-white border-white/60' 
                  : 'bg-white/20 text-white border-white/30 hover:border-white/50'
              }`}
            >
              Pool
            </button>
            <button
              onClick={() => {
                const hasParking = formData.amenities.includes('Parking');
                if (hasParking) {
                  handleInputChange('amenities', formData.amenities.filter(a => a !== 'Parking'));
                } else {
                  handleInputChange('amenities', [...formData.amenities, 'Parking']);
                }
              }}
              className={`px-4 py-2 rounded-full border transition-colors ${
                formData.amenities.includes('Parking') 
                  ? 'bg-white/40 text-white border-white/60' 
                  : 'bg-white/20 text-white border-white/30 hover:border-white/50'
              }`}
            >
              Parking
            </button>
          </div>
        </div>

        {/* D. "Amenities" 显示区域 */}
        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 shadow-md text-white/90 mb-6">
          <h3 className="text-xl font-semibold text-white mb-4">Amenities</h3>
          {formData.amenities.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {formData.amenities.map((amenity, index) => (
                <Badge key={index} variant="secondary" className="px-3 py-1">
                  {amenity}
                  <button
                    onClick={() => removeAmenity(amenity)}
                    className="ml-2 text-gray-500 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
                      ) : (
              <p className="text-white/70 text-sm">No amenities selected yet. Use the buttons above to add amenities.</p>
            )}
        </div>

        {/* D. 发布按钮 */}
        <button
          onClick={handleSubmit}
          disabled={isPublishing}
          className="w-full bg-[#2563eb] text-white font-semibold rounded-xl py-3 mt-6 sticky bottom-4 shadow-lg transition-colors"
        >
          {isPublishing ? 'Publishing...' : 'Publish Listing'}
        </button>

      </div>
    </ColoredPageWrapper>
  );
};

export default CreateListingPage; 