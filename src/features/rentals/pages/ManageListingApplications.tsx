import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { User, Mail, Clock, CheckCircle, ArrowLeft } from 'lucide-react';
import apiClient from '@/services/apiClient';
import ColoredPageWrapper from '@/components/layout/ColoredPageWrapper';

interface Application {
  id: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  applicantLanguages?: string[];
  status: 'pending' | 'accepted' | 'ignored';
  message: string;
  appliedAt: string;
  listingId: string;
}

const ManageListingApplications: React.FC = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [applicationToAccept, setApplicationToAccept] = useState<string | null>(null);

  const handleBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    const fetchApplications = async () => {
      if (!listingId) return;
      
      try {
        console.log('🔍 Fetching applications for listing:', listingId);
        const response = await apiClient.get(`/listings/${listingId}/applications`);
        
        console.log('📋 Received applications:', response.data);
        
        if (response.data.success && response.data.data) {
          // Transform the API response to match the component's interface
          const transformedApplications = response.data.data.applications.map((app: any) => ({
            id: app.applicationId,
            applicantId: app.applicantId,
            applicantName: app.applicant?.profile?.name || 'Anonymous',
            applicantEmail: app.applicant?.email || '',
            applicantLanguages: app.applicant?.profile?.languages || [],
            status: app.status,
            message: app.message || '',
            appliedAt: app.createdAt,
            listingId: app.listingId
          }));
          setApplications(transformedApplications);
        } else {
          throw new Error('Invalid response format');
        }
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
      const response = await apiClient.post(`/applications/${applicationId}/accept`);
      
      console.log('✅ Application accepted:', response.data);

      // Update the local state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: 'accepted' as const }
            : app
        )
      );
      
      // Close the dialog and reset state
      setShowConfirmDialog(false);
      setApplicationToAccept(null);
    } catch (err) {
      console.error('Error accepting application:', err);
      setError('Failed to accept application');
      // Close the dialog on error too
      setShowConfirmDialog(false);
      setApplicationToAccept(null);
    }
  };

  const handleAcceptClick = (applicationId: string) => {
    setApplicationToAccept(applicationId);
    setShowConfirmDialog(true);
  };

  const handleConfirmAccept = () => {
    if (applicationToAccept) {
      handleAcceptApplication(applicationToAccept);
    }
  };

  const handleCancelAccept = () => {
    setShowConfirmDialog(false);
    setApplicationToAccept(null);
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
      <ColoredPageWrapper seed={listingId || 'applications'}>
        <div className="sticky top-0 z-50 py-3 px-4" style={{ height: 'calc(16px + 1.5rem)' }}>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleBack}
            className="p-0 h-auto w-auto bg-transparent hover:bg-transparent"
          >
            <ArrowLeft className="h-5 w-5 text-white/90" />
          </Button>
        </div>
        <div className="container mx-auto p-6 pb-24">
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/60 mx-auto"></div>
              <p className="mt-2 text-white/70">Loading applications...</p>
            </div>
          </div>
        </div>
      </ColoredPageWrapper>
    );
  }

  if (error) {
    return (
      <ColoredPageWrapper seed={listingId || 'applications'}>
        <div className="sticky top-0 z-50 py-3 px-4" style={{ height: 'calc(16px + 1.5rem)' }}>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleBack}
            className="p-0 h-auto w-auto bg-transparent hover:bg-transparent"
          >
            <ArrowLeft className="h-5 w-5 text-white/90" />
          </Button>
        </div>
        <div className="container mx-auto p-6 pb-24">
          <div className="text-center text-red-400">
            <p>{error}</p>
          </div>
        </div>
      </ColoredPageWrapper>
    );
  }

  return (
    <ColoredPageWrapper seed={listingId || 'applications'}>
      {/* Sticky Header - Consistent with CafeDetail */}
      <div className="sticky top-0 z-50 py-3 px-4" style={{ height: 'calc(16px + 1.5rem)' }}>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleBack}
          className="p-0 h-auto w-auto bg-transparent hover:bg-transparent"
        >
          <ArrowLeft className="h-5 w-5 text-white/90" />
        </Button>
      </div>
      
      <div className="container mx-auto p-6 pb-8">
        <p className="text-white/70 mb-6">Listing ID: {listingId}</p>
      
        {applications.length === 0 ? (
          <Card className="bg-black/40 backdrop-blur-sm border-none">
            <CardContent className="p-6 text-center">
              <p className="text-white/70">No applications found for this listing.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <Card key={application.id} className="w-full bg-black/40 backdrop-blur-sm border-none">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-white/90">
                      <User className="w-5 h-5" />
                      {application.applicantName}
                    </CardTitle>
                  {getStatusBadge(application.status)}
                </div>
              </CardHeader>
              <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-base text-white/70">
                      <Mail className="w-4 h-4" />
                      {application.applicantEmail}
                    </div>
                    
                    <div className="text-base text-white/70">
                      Applied: {new Date(application.appliedAt).toLocaleDateString()}
                    </div>
                  
                  {application.applicantLanguages && application.applicantLanguages.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {application.applicantLanguages.map((language, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                        >
                          {language}
                        </span>
                      ))}
                    </div>
                  )}
                  
                    {application.message && (
                      <div className="bg-white/10 p-3 rounded-md">
                        <p className="text-base text-white/90">{application.message}</p>
                      </div>
                    )}
                  
                  {application.status === 'pending' && (
                    <div className="flex gap-2 pt-3">
                      <Button 
                        onClick={() => handleAcceptClick(application.id)}
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
                        <p className="text-base text-green-800">
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
      
      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Acceptance?</DialogTitle>
            <DialogDescription>
              This action is final and cannot be undone. The applicant will be notified.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelAccept}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmAccept}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
        </Dialog>
      </div>
    </ColoredPageWrapper>
  );
};

export default ManageListingApplications;
