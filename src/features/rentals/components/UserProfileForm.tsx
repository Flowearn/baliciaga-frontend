import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateUserProfileData, createUserProfile } from '@/services/userService';
import { toast } from "sonner";

interface UserProfileFormProps {
  onProfileCreated: () => void;
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({ onProfileCreated }) => {
  const [formData, setFormData] = useState<CreateUserProfileData>({
    fullName: '',
    gender: 'male',
    nationality: '',
    age: 25,
    whatsapp: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof CreateUserProfileData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Basic validation
      if (!formData.fullName.trim()) {
        toast.error('Please enter your full name');
        return;
      }
      if (!formData.nationality.trim()) {
        toast.error('Please enter your nationality');
        return;
      }
      if (formData.age < 0 || formData.age > 200) {
        toast.error('Age must be between 0 and 200');
        return;
      }
      if (!formData.whatsapp.trim()) {
        toast.error('Please enter your WhatsApp number');
        return;
      }

      await createUserProfile(formData);
      toast.success('Profile created successfully!');
      onProfileCreated();
    } catch (error) {
      console.error('Error creating profile:', error);
      toast.error('Failed to create profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
          <CardDescription>
            Welcome to Baliciaga! Please fill in your personal information to continue using our services.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value: 'male' | 'female' | 'other') => handleInputChange('gender', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="nationality">Nationality</Label>
              <Input
                id="nationality"
                type="text"
                value={formData.nationality}
                onChange={(e) => handleInputChange('nationality', e.target.value)}
                placeholder="e.g., Chinese, American, Japanese"
                required
              />
            </div>

            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                min="0"
                max="200"
                value={formData.age}
                onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                required
              />
            </div>

            <div>
              <Label htmlFor="whatsapp">WhatsApp Number</Label>
              <Input
                id="whatsapp"
                type="text"
                value={formData.whatsapp}
                onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                placeholder="e.g., +86 138 0013 8000"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfileForm; 