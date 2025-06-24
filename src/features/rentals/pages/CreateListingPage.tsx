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
import { X, Upload, Sparkles, Plus, UploadCloud, User, Building, Menu as MenuIcon, ImagePlus } from 'lucide-react';
import { analyzeListingSource, AnalyzeSourceResponse, createListing } from '@/services/listingService';
import { uploadListingPhotos } from '@/services/uploadService';
import { isInternalStaff } from '@/utils/authUtils';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import LeaseDurationSelector from '@/features/rentals/components/LeaseDurationSelector';

// Extended type for AI extracted data with additional fields
interface ExtractedListingWithAI {
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
  locationArea?: string;
  availableFrom: string;
  minimumStay: number;
  description: string;
  amenities: string[];
  aiExtractedData?: {
    monthlyRent?: number;
    yearlyRent?: number;
    price_yearly_idr?: number;
    price_yearly_usd?: number;
    landSize?: number;
    buildingSize?: number;
  };
}

interface ListingFormData {
  title: string;
  monthlyRent: number | string;
  yearlyRent: number | string | null;
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
  
  // State for random background color
  const [bgColor, setBgColor] = useState<string>('');
  
  // Poster role state
  const [posterRole, setPosterRole] = useState<'tenant' | 'landlord' | 'platform' | null>(null);
  const [showPlatformOption, setShowPlatformOption] = useState(false);
  
  // Lease duration state
  const [leaseDuration, setLeaseDuration] = useState<string>('');

  // Photo error state
  const [photoError, setPhotoError] = useState('');

  // Random background color effect
  useEffect(() => {
    const pantoneBackgroundColors = [
      '#F0F1E3', // PANTONE 11-4302 Cannoli Cream
      '#DFC9B8', // PANTONE 13-1108 Cream Tan
      '#B7AC93', // PANTONE 15-1116 Safari
      '#BDA08A', // PANTONE 15-1317 Sirocco
      '#9E7B66', // PANTONE 17-1230 Mocha Mousse
      '#9E8977', // PANTONE 16-1414 Chanterelle
      '#86675B', // PANTONE 18-1421 Baltic Amber
      '#534540'  // PANTONE 19-1216 Chocolate Martini
    ];
    const randomIndex = Math.floor(Math.random() * pantoneBackgroundColors.length);
    setBgColor(pantoneBackgroundColors[randomIndex]);
  }, []); // Empty dependency array ensures this runs only once on mount
  
  // Check if user is InternalStaff
  useEffect(() => {
    const checkInternalStaff = async () => {
      const isStaff = await isInternalStaff();
      setShowPlatformOption(isStaff);
    };
    checkInternalStaff();
  }, []);

  // Form state
  const [formData, setFormData] = useState<ListingFormData>({
    title: '',
    monthlyRent: 0,
    yearlyRent: null,
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
  const [selectedScreenshot, setSelectedScreenshot] = useState<File | null>(null);

  // Photo preview state
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  // Auto-resize textarea ref
  const textareaRef = useAutoResizeTextarea(aiInput);
  
  // File input ref for screenshot upload
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    // Clear photo error when photos are added
    if (newFiles.length > 0) {
      setPhotoError('');
    }
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
    
    // Clear photo error when photos are removed (will be handled by submit validation)
    setPhotoError('');
  };

  // Handle file selection for screenshot upload
  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('Screenshot for AI selected:', file.name);
      setSelectedScreenshot(file);
      toast.success('截图已选择', {
        description: `已选择文件: ${file.name}`
      });
    }
  };

  // Handle AI analysis
  const handleAnalyzeSource = async () => {
    // 如果有文件被选中，则优先处理文件
    if (selectedScreenshot) {
      const formData = new FormData();
      formData.append('sourceImage', selectedScreenshot); // 'sourceImage'是后端期望的字段名

      try {
        setIsAnalyzing(true);
        
        // 调用API，将formData发送到后端
        const response = await analyzeListingSource(formData); 
        
        if (response.success && response.data) {
          const extracted = response.data.extractedListing as ExtractedListingWithAI;
          const aiData = extracted.aiExtractedData;
          setFormData(prev => ({
            ...prev,
            title: extracted.title || prev.title,
            monthlyRent: extracted.monthlyRent || aiData?.monthlyRent || prev.monthlyRent,
            yearlyRent: aiData?.yearlyRent || aiData?.price_yearly_idr || aiData?.price_yearly_usd || prev.yearlyRent,
            bedrooms: extracted.bedrooms || prev.bedrooms,
            bathrooms: extracted.bathrooms || prev.bathrooms,
            squareFootage: extracted.squareFootage || aiData?.landSize || aiData?.buildingSize || prev.squareFootage,
            address: extracted.address || prev.address,
            locationArea: extracted.locationArea || aiData?.locationArea || prev.locationArea,
            currency: extracted.currency || prev.currency,
            minimumStay: extracted.minimumStay ? parseMinimumStay(extracted.minimumStay) : prev.minimumStay,
            amenities: (extracted.amenities && extracted.amenities.length > 0) ? extracted.amenities : prev.amenities,
          }));
          
          toast.success('AI analysis completed!', {
            description: 'Form fields have been filled automatically. You can review and modify them.'
          });
        } else {
          throw new Error(response.error?.message || 'Analysis failed');
        }
      } catch (error: unknown) {
        console.error('AI image analysis error:', error);
        toast.error('AI image analysis failed', {
          description: 'Please try again with a different image or use text input.'
        });
      } finally {
        setIsAnalyzing(false);
      }

    } else if (aiInput.trim()) { // 如果没有文件，再处理文本
      try {
        setIsAnalyzing(true);
        
        const response = await analyzeListingSource(aiInput);
        
        if (response.success && response.data) {
          const extracted = response.data.extractedListing as ExtractedListingWithAI;
          const aiData = extracted.aiExtractedData;
          setFormData(prev => ({
            ...prev,
            title: extracted.title || prev.title,
            monthlyRent: extracted.monthlyRent || aiData?.monthlyRent || prev.monthlyRent,
            yearlyRent: aiData?.yearlyRent || aiData?.price_yearly_idr || aiData?.price_yearly_usd || prev.yearlyRent,
            bedrooms: extracted.bedrooms || prev.bedrooms,
            bathrooms: extracted.bathrooms || prev.bathrooms,
            squareFootage: extracted.squareFootage || aiData?.landSize || aiData?.buildingSize || prev.squareFootage,
            address: extracted.address || prev.address,
            locationArea: extracted.locationArea || aiData?.locationArea || prev.locationArea,
            currency: extracted.currency || prev.currency,
            minimumStay: extracted.minimumStay ? parseMinimumStay(extracted.minimumStay) : prev.minimumStay,
            amenities: (extracted.amenities && extracted.amenities.length > 0) ? extracted.amenities : prev.amenities,
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
    } else {
      toast.error("Please provide a screenshot or text to analyze.");
    }
  };

  // Helper function to parse minimum stay string (e.g., "6 months" -> 6)
  const parseMinimumStay = (stayInput: string | number | null): number => {
    // Handle null or undefined
    if (!stayInput && stayInput !== 0) {
      return 1;
    }
    
    // If it's already a number, return it
    if (typeof stayInput === 'number') {
      return Math.max(1, stayInput);
    }
    
    // If it's a string, try to extract number
    if (typeof stayInput === 'string') {
      const match = stayInput.match(/(\d+)/);
      return match ? parseInt(match[1]) : 1;
    }
    
    // Fallback
    return 1;
  };

  // Helper function to format price for display
  const formatPrice = (amount: number | string | null, currency: string): string => {
    if (!amount || amount === 0) return '';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (currency === 'IDR') {
      // Format IDR in millions (e.g., 25000000 -> "Rp 25M")
      if (numAmount >= 1000000) {
        return `Rp ${(numAmount / 1000000).toFixed(1)}M`;
      } else {
        return `Rp ${numAmount.toLocaleString()}`;
      }
    } else {
      // Format USD with thousands separator
      return `$${numAmount.toLocaleString()}`;
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
    // Photo validation: check at the very beginning
    if (formData.photos.length === 0) {
      setPhotoError('At least one photo is required.');
      return;
    } else {
      setPhotoError(''); // Clear error if photos exist
    }

    // Convert string values to numbers for validation and submission
    let monthlyRent = typeof formData.monthlyRent === 'string' ? Number(formData.monthlyRent) || 0 : formData.monthlyRent;
    let yearlyRent = typeof formData.yearlyRent === 'string' ? (formData.yearlyRent === '' ? null : Number(formData.yearlyRent)) : formData.yearlyRent;
    const bedrooms = typeof formData.bedrooms === 'string' ? Number(formData.bedrooms) || 0 : formData.bedrooms;
    const bathrooms = typeof formData.bathrooms === 'string' ? Number(formData.bathrooms) || 0 : formData.bathrooms;
    const minimumStay = typeof formData.minimumStay === 'string' ? Number(formData.minimumStay) || 1 : formData.minimumStay;
    const squareFootage = typeof formData.squareFootage === 'string' ? (formData.squareFootage === '' ? null : Number(formData.squareFootage)) : formData.squareFootage;

    // Enhanced validation: at least one price field must be filled
    if (!formData.title || !formData.address) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Price validation: at least one of monthlyRent or yearlyRent must be provided (可以为0)
    if (monthlyRent === null && yearlyRent === null) {
      toast.error('Please provide either Monthly Rent or Yearly Rent');
      return;
    }

    // Poster role validation
    if (!posterRole) {
      toast.error('Please select your role');
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
        yearlyRent: yearlyRent,
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
        photos: photoUrls, // 修复：传递实际的图片URL数组而不是空数组
        leaseDuration: leaseDuration // Add lease duration to payload
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
    <div style={{ backgroundColor: bgColor || '#534540' }} className="relative min-h-screen">
      {/* 半透明蒙版 */}
      <div className="absolute inset-0 bg-black/40 z-10" />
      
      {/* 内容层 */}
      <div className="relative z-20">
        <div className="max-w-2xl mx-auto space-y-6 px-4 py-6">
        
        {/* A. AI 提取区域 - 移动到顶部 */}
        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 shadow-md text-white/90">
          <div className="space-y-4">
              <p className="text-white text-base">
                Paste the property description or upload a screenshot of it, then click 'Extract Info' to get started.
              </p>
              <Textarea
                ref={textareaRef}
                className="w-full min-h-[80px] resize-none bg-white/10 focus:bg-white/20 placeholder:text-white/20 text-white border-white/20 focus:border-white/40"
                placeholder="Paste the property description here, e.g. URL or details..."
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
              />
              
              {/* 显示选中的截图 */}
              {selectedScreenshot && (
                <div className="bg-white/10 rounded-lg p-3 flex items-center gap-3">
                  <Upload className="h-4 w-4 text-green-400" />
                  <span className="text-base text-white/90">已选择截图: {selectedScreenshot.name}</span>
                  <button
                    onClick={() => setSelectedScreenshot(null)}
                    className="ml-auto text-white/60 hover:text-red-400"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 bg-transparent text-white border border-white/20 hover:bg-white/10 hover:border-white/30 rounded-full px-4 h-9 text-sm"
                >
                  <Upload className="h-4 w-4 mr-1" />
                  {selectedScreenshot ? 'Change Screenshot' : 'Upload Screenshot'}
                </Button>
                <Button
                  onClick={handleAnalyzeSource}
                  className="flex-1 bg-white text-[#0a0a0a] hover:bg-white/90 rounded-full px-4 h-9 text-sm font-medium"
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  {isAnalyzing ? 'Analyzing...' : 'Extract Info'}
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelected}
                  style={{ display: 'none' }}
                  accept="image/png, image/jpeg, application/pdf"
                />
              </div>
            </div>
        </div>

        {/* Image Upload Section - 移动到AI区域之后 */}
        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 shadow-md text-white/90">
          {/* 双列布局 */}
          <div className="flex items-center gap-4">
            {/* 左侧图标容器 */}
            <div className="w-20 h-20 flex items-center justify-center bg-black/20 rounded-xl border border-white/10 flex-shrink-0">
              <ImagePlus className="w-10 h-10 text-white/60" />
            </div>

            {/* 右侧内容块 */}
            <div className="flex-1 flex flex-col items-end gap-2">
              <h3 className="text-xl font-bold text-white/90">Property Photos <span className="text-red-500 ml-1">*</span></h3>
              <div className="flex items-center gap-3">
                {formData.photos.length > 0 && (
                  <span className="text-base text-white/70">
                    {formData.photos.length}/10 photos
                  </span>
                )}
                <Button
                  {...getRootProps()}
                  className="bg-white text-[#0a0a0a] hover:bg-white/90 rounded-full px-3 h-9 text-sm font-medium"
                >
                  <input {...getInputProps()} />
                  <UploadCloud className="h-4 w-4 mr-1" />
                  Upload
                </Button>
              </div>
            </div>
          </div>

                      {/* Photo Previews */}
            {photoPreviews.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  Uploaded Photos ({photoPreviews.length}/10)
                </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {photoPreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <OptimizedImage
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      aspectRatio="1:1"
                      priority={false}
                      className="rounded-lg border"
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
          
          {/* Photo validation error message */}
          {photoError && (
            <p className="text-red-500 text-sm mt-2">{photoError}</p>
          )}
        </div>
        
        {/* B. "Property Details" 表单区域 */}
        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 shadow-md text-white/90 mb-6">
          <h2 className="text-xl font-bold text-white mb-6">Property Details</h2>
          
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

          {/* Location Area */}
          <div className="mb-4">
            <label htmlFor="locationArea" className="block text-base font-medium text-white/90 mb-2">
              Location Area
            </label>
            <input
              id="locationArea"
              type="text"
              className="w-full h-10 py-2 px-3 bg-white/10 focus:bg-white/20 placeholder-white/20 text-white text-base border border-white/20 focus:border-white/40 rounded-lg focus:outline-none"
              value={formData.locationArea}
              onChange={(e) => handleInputChange('locationArea', e.target.value)}
              placeholder="e.g., Canggu, Ubud, Seminyak"
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
                onChange={(e) => handleNumberInputChange('bedrooms', e)}
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
                onChange={(e) => handleNumberInputChange('bathrooms', e)}
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
                onChange={(e) => handleNumberInputChange('squareFootage', e)}
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
                onChange={(e) => handleNumberInputChange('minimumStay', e)}
              />
            </div>
          </div>

          {/* Price Section - Smart Display Logic */}
          <div className="mb-6">
            {/* Monthly Rent */}
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
                    onChange={(e) => handleNumberInputChange('monthlyRent', e)}
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
            <div className="mt-4">
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
                    onChange={(e) => handleNumberInputChange('yearlyRent', e)}
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
              {formData.yearlyRent && formData.yearlyRent !== '' && parseFloat(formData.yearlyRent.toString()) > 0 && (
                <p className="text-sm text-white/60 mt-1">
                  (equivalent monthly = {formatPrice(
                    Math.round((typeof formData.yearlyRent === 'string' ? parseFloat(formData.yearlyRent) : formData.yearlyRent) / 12),
                    formData.currency
                  )})
                </p>
              )}
            </div>
          </div>

          {/* Amenities Section */}
          <div className="mt-6">
            <h3 className="text-xl font-bold text-white mb-4">Amenities</h3>
            {formData.amenities.length > 0 && (
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
            )}
          </div>
        </div>

        {/* Initiator Info Container */}
        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 shadow-md text-white/90 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Initiator Info <span className="text-red-500 ml-1">*</span></h2>
          
          {/* Poster Role Selection */}
          <p className="text-base text-white/90 mb-3">I am ...</p>
          <div className={`grid ${showPlatformOption ? 'grid-cols-3' : 'grid-cols-2'} gap-4 mb-6`}>
            <div className="flex flex-col items-center gap-2">
              <User className="h-6 w-6 text-white/60" />
              <button
                onClick={() => setPosterRole('tenant')}
                className={`h-9 w-full px-4 rounded-full transition-all duration-200 flex items-center justify-center text-sm ${
                  posterRole === 'tenant'
                    ? 'bg-white text-gray-800'
                    : 'bg-white/10 text-white/70 hover:bg-white/15'
                }`}
              >
                Tenant
              </button>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Building className="h-6 w-6 text-white/60" />
              <button
                onClick={() => setPosterRole('landlord')}
                className={`h-9 w-full px-4 rounded-full transition-all duration-200 flex items-center justify-center text-sm ${
                  posterRole === 'landlord'
                    ? 'bg-white text-gray-800'
                    : 'bg-white/10 text-white/70 hover:bg-white/15'
                }`}
              >
                Landlord/Agent
              </button>
            </div>
            {showPlatformOption && (
              <div className="flex flex-col items-center gap-2">
                <MenuIcon className="h-6 w-6 text-white/60" />
                <button
                  onClick={() => setPosterRole('platform')}
                  className={`h-9 w-full px-4 rounded-full transition-all duration-200 flex items-center justify-center text-sm ${
                    posterRole === 'platform'
                      ? 'bg-white text-gray-800'
                      : 'bg-white/10 text-white/70 hover:bg-white/15'
                  }`}
                >
                  Platform
                </button>
              </div>
            )}
          </div>
          
          {/* Lease Duration Selection */}
          <p className="text-base text-white/90 mb-3">Preferred Lease Duration</p>
          <LeaseDurationSelector
            selectedDuration={leaseDuration}
            onDurationSelect={setLeaseDuration}
            showNegotiable={true}
            className="grid grid-cols-2 sm:grid-cols-3"
          />
        </div>

        {/* D. 发布按钮 */}
        <div className="mt-6 pb-24 px-4">
          <button
            onClick={handleSubmit}
            disabled={isPublishing || leaseDuration === '' || leaseDuration === null}
            className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-white font-semibold rounded-2xl py-3 transition-colors backdrop-blur-sm border border-blue-500/20"
          >
            {isPublishing ? 'Publishing...' : 'Publish Listing'}
          </button>
        </div>

        </div>
      </div>
    </div>
  );
};

export default CreateListingPage; 