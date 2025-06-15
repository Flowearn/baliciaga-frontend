import React from 'react';
import { User, Calendar, MapPin, Briefcase } from 'lucide-react';
import { ReceivedApplication } from '../../../services/applicationService';

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
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";
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
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {profile.profilePicture ? (
              <img 
                src={profile.profilePicture} 
                alt={applicant.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{applicant.name}</h3>
            <p className="text-sm text-gray-600">{applicant.email}</p>
          </div>
        </div>
        <span className={getStatusBadge()}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>

      {/* Applicant Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {profile.age && (
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-700">{profile.age} years old</span>
          </div>
        )}
        {profile.nationality && (
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-700">{profile.nationality}</span>
          </div>
        )}
        {profile.occupation && (
          <div className="flex items-center space-x-2 col-span-2">
            <Briefcase className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-700">{profile.occupation}</span>
          </div>
        )}
      </div>

      {/* Bio */}
      {profile.bio && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">About</h4>
          <p className="text-sm text-gray-700 bg-gray-50 rounded-md p-3">{profile.bio}</p>
        </div>
      )}

      {/* Application Message */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Application Message</h4>
        <p className="text-sm text-gray-700 bg-blue-50 rounded-md p-3 border-l-4 border-blue-200">
          {message}
        </p>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <span className="text-xs text-gray-500">
          Applied on {formatDate(createdAt)}
        </span>
        
        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={() => onIgnore(application.applicationId)}
            disabled={!isPending || isLoading}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              !isPending || isLoading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {isLoading ? 'Processing...' : 'Ignore'}
          </button>
          <button
            onClick={() => onAccept(application.applicationId)}
            disabled={!isPending || isLoading}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              !isPending || isLoading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Processing...' : 'Accept'}
          </button>
        </div>
      </div>
    </div>
  );
}; 