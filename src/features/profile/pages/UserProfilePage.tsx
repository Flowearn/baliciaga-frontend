import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, ExtendedUser } from '../../../context/AuthContext';
import { signOut } from 'aws-amplify/auth';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { updateUserProfile, UpdateUserProfileData } from '../../../services/userService';
import { uploadAvatarPhoto } from '../../../services/uploadService';
import { toast } from 'sonner';
import { LANGUAGES } from '../../../constants/languages';
import apiClient from '../../../services/apiClient';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { 
  Settings, 
  Edit3, 
  Mail, 
  Calendar, 
  MessageSquare, 
  HelpCircle, 
  User,
  UserCircle2,
  Lock,
  Eye,
  EyeOff,
  Check,
  Loader2,
  X,
  Briefcase,
  Camera,
  Upload
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import EditableField from '../components/EditableField';
import PhoneEditableField from '../components/PhoneEditableField';
import ColoredPageWrapper from '@/components/layout/ColoredPageWrapper';
import { useQueryClient } from '@tanstack/react-query';

// 用户资料表单状态接口
interface ProfileFormData {
  name: string;
  whatsApp: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  languages?: string[];
  occupation?: string;
  profilePictureUrl?: string;
}

const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const queryClient = useQueryClient();
  
  // 转换语言数组为选项格式
  const languageOptions = LANGUAGES.map(lang => ({
    value: lang.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, ''),
    label: lang,
  }));
  
  // 核心编辑状态管理已移除 - 现在使用内联编辑
  
  // 表单状态管理
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    name: '',
    whatsApp: '',
    age: undefined,
    gender: undefined,
    languages: [],
    occupation: ''
  });
  
  // 密码修改状态
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // 语言选择状态
  const [isLanguagePopoverOpen, setIsLanguagePopoverOpen] = useState(false);
  
  // 头像上传状态
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  
  // 图片裁剪状态
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);

  // 初始化表单数据
  useEffect(() => {
    if (user?.profile) {
      const formData = {
        name: user.profile.name || user.username || '',
        whatsApp: user.profile.whatsApp || '',
        age: user.profile.age,
        gender: user.profile.gender,
        languages: user.profile.languages || [],
        occupation: user.profile.occupation || '',
        profilePictureUrl: user.profile.profilePictureUrl
      };
      setProfileForm(formData);
    }
  }, [user]);

  // 全局编辑模式已移除 - 现在使用内联编辑

  // 语言管理函数已移除 - 现在使用内联编辑

  // 头像文件选择处理
  const handleAvatarFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 验证文件类型
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only JPEG, PNG, and WebP images are allowed');
        return;
      }

      // 验证文件大小 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      // 创建临时URL用于裁剪
      const temporaryUrl = URL.createObjectURL(file);
      setImageToCrop(temporaryUrl);
      
      // 重置裁剪状态
      setCrop(undefined);
      setCompletedCrop(undefined);
    }
  };

  // 触发文件选择
  const triggerAvatarUpload = () => {
    const fileInput = document.getElementById('avatar-upload') as HTMLInputElement;
    fileInput?.click();
  };

  // 生成裁剪后的图片
  const getCroppedImg = (image: HTMLImageElement, crop: PixelCrop): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('No 2d context'));
        return;
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      // 设置画布大小为裁剪区域大小
      canvas.width = crop.width;
      canvas.height = crop.height;

      // 绘制裁剪后的图片
      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );

      // 将画布转换为Blob，然后转换为File
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }

        const file = new File([blob], 'cropped-avatar.jpg', {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });

        resolve(file);
      }, 'image/jpeg', 0.95);
    });
  };

  // 确认裁剪并保存头像
  const handleCropConfirm = async () => {
    if (!imgRef.current || !completedCrop) {
      toast.error('Please select a crop area');
      return;
    }

    if (!user || !setUser) {
      toast.error('User not authenticated');
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const croppedFile = await getCroppedImg(imgRef.current, completedCrop);
      
      // 创建新的预览URL
      const previewUrl = URL.createObjectURL(croppedFile);
      setAvatarPreviewUrl(previewUrl);
      
      // 关闭裁剪弹窗
      setImageToCrop(null);
      
      // 清理临时URL
      if (imageToCrop) {
        URL.revokeObjectURL(imageToCrop);
      }

      // 上传头像到后端
      try {
        // 使用上传服务上传头像
        const profilePictureUrl = await uploadAvatarPhoto(croppedFile);

        // 更新用户资料 - 包含完整的字段，防止数据丢失
        const updatedProfile = await updateUserProfile({
          name: profileForm.name,
          whatsApp: profileForm.whatsApp,
          age: profileForm.age,
          gender: profileForm.gender,
          languages: profileForm.languages,
          occupation: profileForm.occupation,
          profilePictureUrl // <-- 这是刚上传成功的新头像URL
        });
        
        // 更新用户状态
        setUser({
          ...user,
          profile: updatedProfile.profile,
          updatedAt: updatedProfile.updatedAt
        } as ExtendedUser);
        
        // 刷新查询缓存
        queryClient.invalidateQueries({ queryKey: ['currentUser'] });
        queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        
        // 同步更新本地表单状态
        const newFormData = {
          name: updatedProfile.profile.name || '',
          whatsApp: updatedProfile.profile.whatsApp || '',
          age: updatedProfile.profile.age,
          gender: updatedProfile.profile.gender,
          languages: updatedProfile.profile.languages || [],
          occupation: updatedProfile.profile.occupation || '',
          profilePictureUrl: updatedProfile.profile.profilePictureUrl
        };
        
        setProfileForm(newFormData);

        // 清理预览状态
        setSelectedAvatarFile(null);
        if (avatarPreviewUrl) {
          URL.revokeObjectURL(avatarPreviewUrl);
          setAvatarPreviewUrl(null);
        }

        toast.success('Avatar updated successfully!');
      } catch (uploadError) {
        console.error('Error uploading avatar:', uploadError);
        toast.error('Failed to upload avatar');
        
        // 清理预览状态
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setAvatarPreviewUrl(null);
        }
      }
    } catch (error) {
      console.error('Error cropping image:', error);
      toast.error('Failed to crop image');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // 取消裁剪
  const handleCropCancel = () => {
    if (imageToCrop) {
      URL.revokeObjectURL(imageToCrop);
    }
    setImageToCrop(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
  };

  // 统一的保存函数
  // 统一的保存函数已移除 - 现在使用内联编辑

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // 个别字段保存函数
  const saveField = async (field: keyof ProfileFormData, value: string | string[]) => {
    if (!user || !setUser) throw new Error('User not authenticated');

    console.log(`📝 Saving field ${field} with value:`, value);
    console.log('Current user:', user);

    // 步骤1：基于当前的表单状态，创建一个更新后的状态副本
    const updatedForm = { ...profileForm, [field]: value };
    
    // 步骤2：乐观更新UI，让用户立即看到变化
    setProfileForm(updatedForm);

    // 步骤3：创建一个只包含我们数据模型中定义的字段的、干净的payload
    // 这能防止任何多余的临时状态字段被发送到后端
    const payloadToSave: UpdateUserProfileData = {
      name: updatedForm.name,
      whatsApp: updatedForm.whatsApp,
      age: updatedForm.age,
      gender: updatedForm.gender,
      languages: updatedForm.languages,
      occupation: updatedForm.occupation,
      profilePictureUrl: updatedForm.profilePictureUrl, // <-- 新增的关键行：保存文字时记住头像
    };

    console.log('💾 Payload to save:', payloadToSave);

    try {
      // 步骤4：将这个完整的、更新后的profile对象发送到后端
      // 后端将用这个对象完整覆盖数据库记录，因为payload是完整的，所以不会再丢失字段
      const updatedProfile = await updateUserProfile(payloadToSave);
      
      console.log('✅ Profile updated successfully:', updatedProfile);
      
      // 更新用户状态
      setUser({
        ...user,
        profile: updatedProfile.profile,
        updatedAt: updatedProfile.updatedAt
      } as ExtendedUser);
      
      // 刷新查询缓存
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      
      toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully!`);
    } catch (error: any) {
      console.error(`Error updating ${field}:`, error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error(`Failed to update ${field}: ${error.response?.data?.error?.message || error.message}`);
      
      // 如果保存失败，回滚UI状态到保存前的状态
      setProfileForm(profileForm);
      throw error;
    }
  };

  return (
    <ColoredPageWrapper seed="profile">
      <div className="relative z-10 max-w-md mx-auto">
        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-8 profile-avatar-section">
          <div className="relative mb-4 cursor-pointer group" onClick={triggerAvatarUpload}>
            <Avatar className="w-24 h-24 transition-opacity group-hover:opacity-80">
              <AvatarImage 
                src={avatarPreviewUrl || user?.profile?.profilePictureUrl} 
                alt={user?.profile?.name || 'User avatar'} 
              />
              <AvatarFallback className="bg-white/20">
                <User className="w-12 h-12 text-white/60" />
              </AvatarFallback>
            </Avatar>
            
            {/* 头像上传按钮 - 始终显示 */}
            <button
              className="absolute -bottom-1 -right-1 w-9 h-9 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              disabled={isUploadingAvatar}
            >
              {isUploadingAvatar ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : (
                <Camera className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
          
          {/* 隐藏的文件输入 */}
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleAvatarFileSelect}
            className="hidden"
          />
        </div>

        {/* Information List */}
        <div className="space-y-4 mb-8 mx-8">
            {/* Name Field */}
            <div className="bg-black/40 backdrop-blur-sm rounded-xl px-4 py-2">
              <EditableField
                label="Name"
                value={profileForm.name}
                onSave={(value) => saveField('name', value)}
                placeholder="Enter your name"
                type="text"
                icon={<UserCircle2 className="w-5 h-5 text-white/60" />}
              />
            </div>

            {/* Age Field */}
            <div className="bg-black/40 backdrop-blur-sm rounded-xl px-4 py-2">
              <EditableField
                label="Age"
                value={profileForm.age}
                onSave={(value) => saveField('age', value)}
                placeholder="Enter your age"
                type="number"
                icon={<Calendar className="w-5 h-5 text-white/60" />}
              />
            </div>

            {/* Gender Field */}
            <div className="bg-black/40 backdrop-blur-sm rounded-xl px-4 py-2">
              <EditableField
                label="Gender"
                value={profileForm.gender}
                onSave={(value) => saveField('gender', value)}
                type="select"
                options={[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' },
                ]}
                icon={<User className="w-5 h-5 text-white/60" />}
              />
            </div>

            {/* WhatsApp Field */}
            <div className="bg-black/40 backdrop-blur-sm rounded-xl px-4 py-2">
              <PhoneEditableField
                label="WhatsApp"
                value={profileForm.whatsApp}
                onSave={(value) => saveField('whatsApp', value)}
                placeholder="Enter phone number"
                icon={<MessageSquare className="w-5 h-5 text-white/60" />}
              />
            </div>

            {/* Occupation Field */}
            <div className="bg-black/40 backdrop-blur-sm rounded-xl px-4 py-2">
              <EditableField
                label="Occupation"
                value={profileForm.occupation}
                onSave={(value) => saveField('occupation', value)}
                placeholder="Enter your occupation"
                type="text"
                icon={<Briefcase className="w-5 h-5 text-white/60" />}
              />
            </div>

            {/* Languages Field */}
            <div className="bg-black/40 backdrop-blur-sm rounded-xl px-4 py-2">
              <EditableField
                label="Languages"
                value={profileForm.languages || []}
                onSave={(newLanguages) => saveField('languages', newLanguages)}
                type="multi-select"
                options={languageOptions}
                icon={<MessageSquare className="w-5 h-5 text-white/60" />}
                placeholder="Select languages..."
              />
            </div>

            {/* Email (Non-editable) */}
            <div className="bg-black/40 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-3">
              <Mail className="w-5 h-5 text-white/60" />
              <span className="text-white/100">{user?.email || 'No email'}</span>
            </div>

            {/* Change Password */}
            <div>
              <div className="bg-black/40 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-3">
                <div 
                  className="flex items-center justify-between cursor-pointer hover:bg-black/20 transition-colors rounded-lg p-1 -m-1 w-full"
                  onClick={() => setIsChangingPassword(prev => !prev)}
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-white/60" />
                    <span className="text-white/100">Change Password</span>
                  </div>
                </div>
              </div>

              {/* Password Input Area */}
              {isChangingPassword && (
                <div className="mt-4 p-4 bg-black/20 backdrop-blur-sm rounded-lg space-y-4 transition-all duration-300 ease-in-out">
                  {/* Current Password */}
                  <div className="space-y-2">
                    <label className="text-base font-medium text-white/80">Current Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Enter current password"
                        className="pl-10 pr-10 bg-black/20 border-white/20 text-white placeholder:text-white/50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-2">
                    <label className="text-base font-medium text-white/80">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Enter new password"
                        className="pl-10 pr-10 bg-black/20 border-white/20 text-white placeholder:text-white/50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div className="space-y-2">
                    <label className="text-base font-medium text-white/80">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Confirm new password"
                        className="pl-10 pr-10 bg-black/20 border-white/20 text-white placeholder:text-white/50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Update Password Button */}
                  <Button className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white border-white/20">
                    Update Password
                  </Button>
                </div>
              )}
            </div>
          </div>

        {/* Sign Out */}
        <div className="mx-8 mb-4">
          <Button 
            onClick={handleSignOut}
            className="w-full bg-red-500/20 hover:bg-red-500/30 text-white border-red-500/20 rounded-full"
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* 图片裁剪弹窗 */}
      <Dialog open={!!imageToCrop} onOpenChange={(open) => !open && handleCropCancel()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Crop Your Avatar</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {imageToCrop && (
              <div className="flex justify-center">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                  circularCrop={true}
                  className="max-w-full"
                >
                  <img
                    ref={imgRef}
                    src={imageToCrop}
                    alt="Crop preview"
                    className="max-w-full h-auto"
                    onLoad={() => {
                      // 设置默认裁剪区域
                      const { width, height } = imgRef.current!;
                      const size = Math.min(width, height) * 0.8;
                      const x = (width - size) / 2;
                      const y = (height - size) / 2;
                      
                      setCrop({
                        unit: 'px',
                        x,
                        y,
                        width: size,
                        height: size,
                      });
                    }}
                  />
                </ReactCrop>
              </div>
            )}
            
            <div className="flex space-x-3">
              <Button 
                onClick={handleCropCancel}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCropConfirm}
                disabled={!completedCrop}
                className="flex-1"
              >
                Confirm Crop
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </ColoredPageWrapper>
  );
};

export default UserProfilePage;

