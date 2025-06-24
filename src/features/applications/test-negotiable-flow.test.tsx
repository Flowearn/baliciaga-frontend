import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ApplicationModal from './components/ApplicationModal';
import { createApplication } from '@/services/applicationService';

// Mock the application service
jest.mock('@/services/applicationService');
jest.mock('@/features/rentals/components/LeaseDurationSelector', () => ({
  __esModule: true,
  default: ({ selectedDuration, onDurationSelect }: any) => (
    <div data-testid="lease-duration-selector">
      {['1-3 months', '3-6 months', '6-12 months', '1 year+'].map((duration) => (
        <button
          key={duration}
          onClick={() => onDurationSelect(duration)}
          data-testid={`duration-option-${duration}`}
          className={selectedDuration === duration ? 'selected' : ''}
        >
          {duration}
        </button>
      ))}
    </div>
  ),
}));

describe('ApplicationModal - Negotiable Lease Duration Flow', () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Test Case 1: Lease Duration Selector Visibility', () => {
    it('should NOT show lease duration selector for non-negotiable listings', () => {
      render(
        <ApplicationModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          listingTitle="Test Property"
          leaseDuration="1 year+"
        />
      );

      expect(screen.queryByTestId('lease-duration-selector')).not.toBeInTheDocument();
      expect(screen.queryByText('Select your preferred lease duration')).not.toBeInTheDocument();
    });

    it('should SHOW lease duration selector for negotiable listings', () => {
      render(
        <ApplicationModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          listingTitle="Test Property"
          leaseDuration="Negotiable"
        />
      );

      expect(screen.getByTestId('lease-duration-selector')).toBeInTheDocument();
      expect(screen.getByText('Select your preferred lease duration')).toBeInTheDocument();
    });

    it('should show all lease duration options', () => {
      render(
        <ApplicationModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          listingTitle="Test Property"
          leaseDuration="Negotiable"
        />
      );

      expect(screen.getByTestId('duration-option-1-3 months')).toBeInTheDocument();
      expect(screen.getByTestId('duration-option-3-6 months')).toBeInTheDocument();
      expect(screen.getByTestId('duration-option-6-12 months')).toBeInTheDocument();
      expect(screen.getByTestId('duration-option-1 year+')).toBeInTheDocument();
    });
  });

  describe('Test Case 2: Submit Button Validation', () => {
    it('should disable submit button initially for negotiable listings', () => {
      render(
        <ApplicationModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          listingTitle="Test Property"
          leaseDuration="Negotiable"
        />
      );

      const submitButton = screen.getByRole('button', { name: /submit application/i });
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button after selecting a lease duration', () => {
      render(
        <ApplicationModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          listingTitle="Test Property"
          leaseDuration="Negotiable"
        />
      );

      const submitButton = screen.getByRole('button', { name: /submit application/i });
      expect(submitButton).toBeDisabled();

      // Select a lease duration
      fireEvent.click(screen.getByTestId('duration-option-6-12 months'));

      expect(submitButton).toBeEnabled();
    });

    it('should enable submit button for non-negotiable listings (no duration selection required)', () => {
      render(
        <ApplicationModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          listingTitle="Test Property"
          leaseDuration="1 year+"
        />
      );

      const submitButton = screen.getByRole('button', { name: /submit application/i });
      expect(submitButton).toBeEnabled();
    });
  });

  describe('Test Case 3: API Payload Verification', () => {
    it('should include applicantLeaseDuration in API call for negotiable listings', async () => {
      const mockSubmit = jest.fn().mockResolvedValue(undefined);
      
      render(
        <ApplicationModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockSubmit}
          listingTitle="Test Property"
          leaseDuration="Negotiable"
        />
      );

      // Select a lease duration
      fireEvent.click(screen.getByTestId('duration-option-3-6 months'));

      // Add message (optional)
      const messageInput = screen.getByPlaceholderText(/say something to the host/i);
      fireEvent.change(messageInput, { target: { value: 'I am interested in this property' } });

      // Submit
      const submitButton = screen.getByRole('button', { name: /submit application/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith(
          'I am interested in this property',
          '3-6 months' // The selected lease duration should be passed
        );
      });
    });

    it('should NOT include applicantLeaseDuration for non-negotiable listings', async () => {
      const mockSubmit = jest.fn().mockResolvedValue(undefined);
      
      render(
        <ApplicationModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockSubmit}
          listingTitle="Test Property"
          leaseDuration="1 year+"
        />
      );

      // Add message
      const messageInput = screen.getByPlaceholderText(/say something to the host/i);
      fireEvent.change(messageInput, { target: { value: 'I am interested' } });

      // Submit
      const submitButton = screen.getByRole('button', { name: /submit application/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith(
          'I am interested',
          undefined // No lease duration should be passed for non-negotiable listings
        );
      });
    });

    it('should handle empty message with selected lease duration', async () => {
      const mockSubmit = jest.fn().mockResolvedValue(undefined);
      
      render(
        <ApplicationModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockSubmit}
          listingTitle="Test Property"
          leaseDuration="Negotiable"
        />
      );

      // Select a lease duration
      fireEvent.click(screen.getByTestId('duration-option-1 year+'));

      // Submit without message
      const submitButton = screen.getByRole('button', { name: /submit application/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith(
          '', // Empty message is allowed
          '1 year+'
        );
      });
    });
  });

  describe('Test Case 4: User Experience Flow', () => {
    it('should reset selections when modal is closed and reopened', () => {
      const { rerender } = render(
        <ApplicationModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          listingTitle="Test Property"
          leaseDuration="Negotiable"
        />
      );

      // Select a duration
      fireEvent.click(screen.getByTestId('duration-option-6-12 months'));
      
      // Add message
      const messageInput = screen.getByPlaceholderText(/say something to the host/i);
      fireEvent.change(messageInput, { target: { value: 'Test message' } });

      // Close modal
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

      // Reopen modal
      rerender(
        <ApplicationModal
          open={false}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          listingTitle="Test Property"
          leaseDuration="Negotiable"
        />
      );
      
      rerender(
        <ApplicationModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          listingTitle="Test Property"
          leaseDuration="Negotiable"
        />
      );

      // Check that selections are reset
      const newMessageInput = screen.getByPlaceholderText(/say something to the host/i);
      expect(newMessageInput).toHaveValue('');
      
      const submitButton = screen.getByRole('button', { name: /submit application/i });
      expect(submitButton).toBeDisabled(); // Should be disabled again
    });

    it('should maintain lease duration requirement during loading state', async () => {
      const mockSubmit = jest.fn(() => new Promise(resolve => setTimeout(resolve, 1000)));
      
      render(
        <ApplicationModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockSubmit}
          listingTitle="Test Property"
          leaseDuration="Negotiable"
        />
      );

      // Select a duration
      fireEvent.click(screen.getByTestId('duration-option-3-6 months'));

      // Submit
      const submitButton = screen.getByRole('button', { name: /submit application/i });
      fireEvent.click(submitButton);

      // Check loading state
      await waitFor(() => {
        expect(screen.getByText(/submitting/i)).toBeInTheDocument();
      });

      // Verify the call was made with correct parameters
      expect(mockSubmit).toHaveBeenCalledWith('', '3-6 months');
    });
  });
});

// Integration test to verify the full flow
describe('Full Application Flow Integration Test', () => {
  it('should complete the entire application process for a negotiable listing', async () => {
    const mockCreateApplication = createApplication as jest.MockedFunction<typeof createApplication>;
    mockCreateApplication.mockResolvedValue({
      success: true,
      data: {
        applicationId: 'test-app-123',
        message: 'Looking forward to viewing',
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
    });

    const handleSubmit = async (message: string, applicantLeaseDuration?: string) => {
      await createApplication('listing-123', message, applicantLeaseDuration);
    };

    render(
      <ApplicationModal
        open={true}
        onClose={jest.fn()}
        onSubmit={handleSubmit}
        listingTitle="Negotiable Lease Property"
        leaseDuration="Negotiable"
      />
    );

    // Verify initial state
    expect(screen.getByText('Select your preferred lease duration')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit application/i })).toBeDisabled();

    // Select lease duration
    fireEvent.click(screen.getByTestId('duration-option-6-12 months'));

    // Add message
    fireEvent.change(screen.getByPlaceholderText(/say something to the host/i), {
      target: { value: 'Looking forward to viewing' },
    });

    // Submit application
    fireEvent.click(screen.getByRole('button', { name: /submit application/i }));

    // Verify API was called correctly
    await waitFor(() => {
      expect(mockCreateApplication).toHaveBeenCalledWith(
        'listing-123',
        'Looking forward to viewing',
        '6-12 months'
      );
    });
  });
});