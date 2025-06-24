import React, { useState } from 'react';
import ApplicationModal from '../components/ApplicationModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

/**
 * Demo component to test the Negotiable lease duration flow
 * This component simulates different listing scenarios to verify
 * the ApplicationModal behavior
 */
export default function NegotiableFlowDemo() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<any[]>([]);

  const handleSubmit = async (
    listingTitle: string,
    message: string,
    applicantLeaseDuration?: string
  ) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const submission = {
      listingTitle,
      message,
      applicantLeaseDuration,
      timestamp: new Date().toISOString(),
    };
    
    setSubmittedData(prev => [...prev, submission]);
    toast.success('Application submitted successfully!');
    setActiveModal(null);
  };

  const testScenarios = [
    {
      id: 'negotiable',
      title: 'Luxury Apartment - Negotiable Lease',
      leaseDuration: 'Negotiable',
      description: 'This listing has a negotiable lease duration. The modal should show lease duration selector.',
      expectedBehavior: [
        'Lease duration selector should be visible',
        'Submit button should be disabled until duration is selected',
        'API payload should include applicantLeaseDuration',
      ],
    },
    {
      id: 'fixed-1year',
      title: 'Modern Condo - 1 Year Lease',
      leaseDuration: '1 year+',
      description: 'This listing has a fixed 1 year+ lease duration. No selector should appear.',
      expectedBehavior: [
        'NO lease duration selector should be visible',
        'Submit button should be enabled immediately',
        'API payload should NOT include applicantLeaseDuration',
      ],
    },
    {
      id: 'fixed-6months',
      title: 'Studio Apartment - 6 Month Lease',
      leaseDuration: '6-12 months',
      description: 'This listing has a fixed 6-12 months lease duration. No selector should appear.',
      expectedBehavior: [
        'NO lease duration selector should be visible',
        'Submit button should be enabled immediately',
        'API payload should NOT include applicantLeaseDuration',
      ],
    },
    {
      id: 'negotiable-2',
      title: 'Shared House - Flexible Terms',
      leaseDuration: 'Negotiable',
      description: 'Another negotiable listing to test consistency.',
      expectedBehavior: [
        'Lease duration selector should be visible',
        'All 4 duration options should be available',
        'Selected duration should be included in submission',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Negotiable Lease Duration Flow Test</h1>
        <p className="text-gray-600 mb-8">
          Click on each listing to test the application modal behavior for different lease duration types.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {testScenarios.map(scenario => (
            <Card key={scenario.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{scenario.title}</span>
                  <Badge 
                    variant={scenario.leaseDuration === 'Negotiable' ? 'default' : 'secondary'}
                    className={scenario.leaseDuration === 'Negotiable' ? 'bg-orange-500' : ''}
                  >
                    {scenario.leaseDuration}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{scenario.description}</p>
                
                <div className="mb-4">
                  <h4 className="font-semibold text-sm mb-2">Expected Behavior:</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {scenario.expectedBehavior.map((behavior, index) => (
                      <li key={index}>{behavior}</li>
                    ))}
                  </ul>
                </div>

                <Button
                  onClick={() => setActiveModal(scenario.id)}
                  className="w-full"
                  variant="outline"
                >
                  Test Application Flow
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Submission Results */}
        {submittedData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Submission Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {submittedData.map((data, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-semibold mb-2">{data.listingTitle}</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Message:</span>{' '}
                        {data.message || '(empty)'}
                      </div>
                      <div>
                        <span className="font-medium">Lease Duration:</span>{' '}
                        <Badge variant={data.applicantLeaseDuration ? 'default' : 'secondary'}>
                          {data.applicantLeaseDuration || 'Not Applicable'}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Submitted at: {new Date(data.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
              
              <Button
                onClick={() => setSubmittedData([])}
                variant="outline"
                size="sm"
                className="mt-4"
              >
                Clear Results
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Render Application Modals */}
        {testScenarios.map(scenario => (
          <ApplicationModal
            key={scenario.id}
            open={activeModal === scenario.id}
            onClose={() => setActiveModal(null)}
            onSubmit={(message, leaseDuration) => 
              handleSubmit(scenario.title, message, leaseDuration)
            }
            listingTitle={scenario.title}
            leaseDuration={scenario.leaseDuration}
          />
        ))}
      </div>
    </div>
  );
}