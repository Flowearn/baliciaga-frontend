import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User,
  Globe,
  Briefcase,
  Phone,
  Check
} from 'lucide-react';
import { ReceivedApplication, updateApplicationStatus } from '@/services/applicationService';
import { formatNoYear } from '@/utils/formatDate';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface ApplicationCardProps {
  application: ReceivedApplication;
  listingId: string;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({ application, listingId }) => {
  const queryClient = useQueryClient();

  // Handle application status update
  const handleStatusUpdate = async (newStatus: 'accepted' | 'ignored' | 'pending') => {
    try {
      const response = await updateApplicationStatus(application.applicationId, newStatus);
      
      if (response.success) {
        toast.success(`Application ${newStatus} successfully`);
        queryClient.invalidateQueries({ queryKey: ['listing-applications', listingId] });
      } else {
        toast.error(response.error?.message || `Failed to ${newStatus} application`);
      }
    } catch (error) {
      console.error(`Error updating application status:`, error);
      toast.error(`Failed to ${newStatus} application`);
    }
  };

  // Render action buttons conditionally based on application status
  const renderActionButtons = () => {
    switch (application.status) {
      case 'pending':
        return (
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => handleStatusUpdate('ignored')}
              className="flex-1"
            >
              Ignore
            </Button>
            <Button 
              onClick={() => handleStatusUpdate('accepted')}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Accept
            </Button>
          </div>
        );
      case 'accepted':
        return (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => handleStatusUpdate('ignored')}
              className="flex-1"
            >
              Ignore
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-600 cursor-default"
              disabled
            >
              <Check className="h-4 w-4 mr-1" />
              Accepted
            </Button>
          </div>
        );
      case 'ignored':
        return (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => handleStatusUpdate('pending')}
              className="flex-1"
            >
              Withdraw
            </Button>
            <Button
              className="flex-1 bg-yellow-500 hover:bg-yellow-500 cursor-default"
              disabled
            >
              Ignored
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="border-t">
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          {/* Left: Profile Avatar */}
          <Avatar className="h-12 w-12">
            <AvatarImage src={application.applicant?.profile?.profilePicture} />
            <AvatarFallback className="bg-gray-200 text-gray-600">
              {application.applicant?.profile?.name?.charAt(0)?.toUpperCase() ?? 'U'}
            </AvatarFallback>
          </Avatar>

          {/* Right: Information and Actions */}
          <div className="flex-grow">
            {/* First Row - Name and Application Date */}
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-gray-900">
                {application.applicant?.profile?.name ?? 'Anonymous'}
              </h4>
              <div className="text-xs text-gray-500">
                Applied {formatNoYear(application.createdAt)}
              </div>
            </div>

            {/* Information Grid - grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-700 with icons */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-700 mb-3">
              {/* Age and Nationality with User icon */}
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                <span>{application.applicant?.profile?.age || 'N/A'} years, {application.applicant?.profile?.nationality || 'Not specified'}</span>
              </div>

              {/* Email with Globe icon */}
              <div className="flex items-center">
                <Globe className="h-4 w-4 mr-2" />
                <span>{application.applicant?.email || 'Not specified'}</span>
              </div>

              {/* Occupation with Briefcase icon */}
              <div className="flex items-center">
                <Briefcase className="h-4 w-4 mr-2" />
                <span>{application.applicant?.profile?.occupation || 'Not specified'}</span>
              </div>

              {/* WhatsApp with Phone icon */}
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                <span>{application.applicant?.profile?.whatsApp || 'Not provided'}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-3">
              {renderActionButtons()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicationCard; 