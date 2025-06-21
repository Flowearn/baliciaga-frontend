import React from 'react';
import { User, Calendar, MapPin, Briefcase, Check, X } from 'lucide-react';
import { ReceivedApplication } from '../../../services/applicationService';
import { Button } from '@/components/ui/button';

interface ReceivedApplicationCardProps {
  application: ReceivedApplication;
  onAccept: (applicationId: string) => void;
  onIgnore: (applicationId: string) => void;
  isLoading?: boolean;
}

export const ReceivedApplicationCard: React.FC<ReceivedApplicationCardProps> = ({
  application,
  onAccept,
  onIgnore,
  isLoading = false
}) => {
  const { applicant, message, status, createdAt } = application;
  const { profile } = applicant;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = () => {
    const baseClasses = "px-3 py-1 rounded-full text-base font-medium";
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'accepted':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'ignored':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const isPending = status === 'pending';

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      {/* Header with Status */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="flex-1 pr-2">
            <div className="font-medium text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">
              {profile.name || applicant.email}
            </div>
            
            {/* Age and Gender in same row */}
            {(profile.age || profile.gender) && (
              <div className="text-base text-gray-700 mt-1 whitespace-nowrap">
                {[
                  profile.age && `${profile.age} years old`,
                  profile.gender && profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)
                ].filter(Boolean).join(' • ')}
              </div>
            )}
            
            {/* Nationality */}
            {profile.nationality && (
              <div className="text-base text-gray-700 whitespace-nowrap">
                {profile.nationality}
              </div>
            )}
            
            {/* Occupation */}
            {profile.occupation && (
              <div className="text-base text-gray-700 mt-1 whitespace-nowrap overflow-hidden text-ellipsis">
                {profile.occupation}
              </div>
            )}
            
            {/* Languages */}
            {profile.languages && profile.languages.length > 0 && (
              <div className="text-base text-gray-700 mt-1">
                {profile.languages.join(', ')}
              </div>
            )}
            
            {/* Applied Date */}
            <div className="text-sm text-gray-500 mt-2">
              Applied on {formatDate(createdAt)}
            </div>
          </div>
          
          <div className="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {profile.profilePicture ? (
              <img 
                src={profile.profilePicture} 
                alt={applicant.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-gray-400" />
            )}
          </div>
        </div>
        
        <span className={getStatusBadge()}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>

      {/* Bio */}
      {profile.bio && (
        <div className="mb-4">
          <p className="text-base text-gray-700 bg-gray-50 rounded-md p-3">{profile.bio}</p>
        </div>
      )}

      {/* Application Message */}
      {message && (
        <div className="mb-6">
          <p className="text-base text-gray-700 bg-blue-50 rounded-md p-3 border-l-4 border-blue-200">
            {message}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      {isPending && (
        <div className="flex gap-3 pt-4 border-t border-gray-100">
            <Button
              onClick={() => onIgnore(application.applicationId)}
              disabled={isLoading}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-700 border-0 rounded-full px-6"
              variant="outline"
            >
              <X className="w-4 h-4 mr-1" />
              {isLoading ? 'Processing...' : 'Ignore'}
            </Button>
            <Button
              onClick={() => onAccept(application.applicationId)}
              disabled={isLoading}
              className="bg-green-500/20 hover:bg-green-500/30 text-green-700 border-0 rounded-full px-6"
              variant="outline"
            >
              <Check className="w-4 h-4 mr-1" />
              {isLoading ? 'Processing...' : 'Accept'}
            </Button>
        </div>
      )}
    </div>
  );
};