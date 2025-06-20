import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User,
  Globe,
  Briefcase,
  Phone,
  Check,
  X
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
  const profile = application.applicant?.profile;

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
          <>
            <Button 
              variant="outline"
              onClick={() => handleStatusUpdate('ignored')}
              className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-white border-0 rounded-full"
            >
              <X className="h-4 w-4 mr-1" />
              Ignore
            </Button>
            <Button 
              onClick={() => handleStatusUpdate('accepted')}
              className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-white border-0 rounded-full"
            >
              <Check className="h-4 w-4 mr-1" />
              Accept
            </Button>
          </>
        );
      case 'accepted':
        return (
          <>
            <Button
              variant="outline"
              onClick={() => handleStatusUpdate('ignored')}
              className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-white border-0 rounded-full"
            >
              <X className="h-4 w-4 mr-1" />
              Ignore
            </Button>
            <Button
              className="flex-1 bg-green-500/20 hover:bg-green-500/20 cursor-default text-white border-0 rounded-full"
              disabled
            >
              <Check className="h-4 w-4 mr-1" />
              Accepted
            </Button>
          </>
        );
      case 'ignored':
        return (
          <>
            <Button
              variant="outline"
              onClick={() => handleStatusUpdate('pending')}
              className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-white border-0 rounded-full"
            >
              Withdraw
            </Button>
            <Button
              className="flex-1 bg-yellow-500/20 hover:bg-yellow-500/20 cursor-default text-white border-0 rounded-full"
              disabled
            >
              Ignored
            </Button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 bg-white/10 rounded-lg border-none">
      {/* Main content layout */}
      <div className="flex gap-3 items-start">
        {/* Left side: Information */}
        <div className="flex-1 pr-2">
          {/* Name */}
          <h4 className="font-semibold text-white whitespace-nowrap overflow-hidden text-ellipsis mb-1">
            {profile?.name || application.applicant?.email || 'Anonymous'}
          </h4>
          
          {/* Applied Date */}
          <div className="text-sm text-white/60 mb-2">
            Applied {formatNoYear(application.createdAt)}
          </div>
          
          {/* Email */}
          {application.applicant?.email && (
            <div className="text-base text-white/80 whitespace-nowrap overflow-hidden text-ellipsis">
              {application.applicant.email}
            </div>
          )}
          
          {/* Age and Gender in same row */}
          {(profile?.age || profile?.gender) && (
            <div className="text-base text-white/80 mt-1 whitespace-nowrap">
              {[
                profile.age && `${profile.age} years old`,
                profile.gender && profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)
              ].filter(Boolean).join(' • ')}
            </div>
          )}
          
          {/* Nationality */}
          {profile?.nationality && (
            <div className="text-base text-white/80 whitespace-nowrap">
              {profile.nationality}
            </div>
          )}
          
          {/* Occupation */}
          {profile?.occupation && (
            <div className="text-base text-white/80 mt-1 whitespace-nowrap overflow-hidden text-ellipsis">
              {profile.occupation}
            </div>
          )}
          
          {/* Languages */}
          {profile?.languages && profile.languages.length > 0 && (
            <div className="text-base text-white/80 mt-1">
              {profile.languages.join(', ')}
            </div>
          )}
          
          {/* Application Message */}
          {application.message && (
            <div className="mt-3 p-3 bg-white/10 rounded-lg">
              <p className="text-sm text-white/90">{application.message}</p>
            </div>
          )}
        </div>
        
        {/* Right side: Avatar */}
        <div className="w-24 h-24 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {profile?.profilePicture || profile?.profilePictureUrl ? (
            <img 
              src={profile.profilePicture || profile.profilePictureUrl} 
              alt={profile?.name || 'Anonymous'}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-12 h-12 text-white/80" />
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 w-full mt-4">
        {renderActionButtons()}
      </div>
    </div>
  );
};

export default ApplicationCard;