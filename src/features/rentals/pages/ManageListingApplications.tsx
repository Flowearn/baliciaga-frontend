import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Clock, CheckCircle } from 'lucide-react';

interface Application {
  id: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  status: 'pending' | 'accepted' | 'ignored';
  message: string;
  appliedAt: string;
  listingId: string;
}

const ManageListingApplications: React.FC = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!listingId) return;
      
      try {
        console.log('🔍 Fetching applications for listing:', listingId);
        const response = await fetch(`/api/listings/${listingId}/applications`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch applications');
        }
        
        const data = await response.json();
        console.log('📋 Received applications:', data);
        setApplications(data);
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError('Failed to load applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [listingId]);

  const handleAcceptApplication = async (applicationId: string) => {
    try {
      console.log('✅ Accepting application:', applicationId);
      const response = await fetch(`/api/applications/${applicationId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to accept application');
      }

      const result = await response.json();
      console.log('✅ Application accepted:', result);

      // Update the local state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: 'accepted' as const }
            : app
        )
      );
    } catch (err) {
      console.error('Error accepting application:', err);
      setError('Failed to accept application');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'accepted':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Accepted
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 pb-20">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading applications...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 pb-20">
        <div className="text-center text-red-600">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 pb-20">
      <h1 className="text-2xl font-bold mb-6">Manage Listing Applications</h1>
      <p className="text-gray-600 mb-6">Listing ID: {listingId}</p>
      
      {applications.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No applications found for this listing.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <Card key={application.id} className="w-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {application.applicantName}
                  </CardTitle>
                  {getStatusBadge(application.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    {application.applicantEmail}
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    Applied: {new Date(application.appliedAt).toLocaleDateString()}
                  </div>
                  
                  {application.message && (
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm">{application.message}</p>
                    </div>
                  )}
                  
                  {application.status === 'pending' && (
                    <div className="flex gap-2 pt-3">
                      <Button 
                        onClick={() => handleAcceptApplication(application.id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Accept Application
                      </Button>
                      <Button variant="outline">
                        Ignore
                      </Button>
                    </div>
                  )}
                  
                  {application.status === 'accepted' && (
                    <div className="pt-3">
                      <div className="bg-green-50 border border-green-200 rounded-md p-3">
                        <p className="text-sm text-green-800">
                          ✅ This application has been accepted! The applicant will be notified.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageListingApplications;
