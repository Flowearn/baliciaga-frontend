import React from 'react';
import { render, waitFor } from '@testing-library/react';
import StagewiseWrapper from '../StagewiseWrapper';

// Mock the Stagewise imports
jest.mock('@stagewise/toolbar-react', () => ({
  StagewiseToolbar: ({ config }: any) => <div data-testid="stagewise-toolbar">Stagewise Toolbar</div>
}));

jest.mock('@stagewise-plugins/react', () => ({
  ReactPlugin: {}
}));

// Mock environment variables
const mockEnv = (mode: string, enableStagewise?: string) => {
  Object.defineProperty(import.meta, 'env', {
    value: {
      MODE: mode,
      VITE_ENABLE_STAGEWISE: enableStagewise,
    },
    writable: true,
  });
};

describe('StagewiseWrapper', () => {
  beforeEach(() => {
    // Clean up any existing elements
    document.querySelectorAll('[id*="stagewise"]').forEach(el => el.remove());
  });

  afterEach(() => {
    // Clean up after each test
    document.querySelectorAll('[id*="stagewise"]').forEach(el => el.remove());
  });

  it('should render Stagewise toolbar in development mode', async () => {
    mockEnv('development');
    
    const { getByTestId } = render(<StagewiseWrapper />);
    
    // Wait for component to be ready and render
    await waitFor(() => {
      expect(getByTestId('stagewise-toolbar')).toBeInTheDocument();
    });
  });

  it('should not render in production mode by default', async () => {
    mockEnv('production');
    
    const { container } = render(<StagewiseWrapper />);
    
    // Should render nothing
    expect(container.firstChild).toBeNull();
  });

  it('should render in production when explicitly enabled', async () => {
    mockEnv('production', 'true');
    
    const { getByTestId } = render(<StagewiseWrapper />);
    
    // Wait for component to be ready and render
    await waitFor(() => {
      expect(getByTestId('stagewise-toolbar')).toBeInTheDocument();
    });
  });

  it('should clean up properly on unmount', async () => {
    mockEnv('development');
    
    const { unmount, getByTestId } = render(<StagewiseWrapper />);
    
    // Wait for initialization
    await waitFor(() => {
      expect(getByTestId('stagewise-toolbar')).toBeInTheDocument();
    });
    
    // Unmount the component
    unmount();
    
    // Clean up should remove toolbar (though we can't easily test DOM cleanup in this simple mock)
    expect(() => getByTestId('stagewise-toolbar')).toThrow();
  });

  it('should handle rendering errors gracefully', async () => {
    mockEnv('development');
    
    // Mock console.error to check if errors are logged
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Force an error in the component
    jest.doMock('@stagewise/toolbar-react', () => ({
      StagewiseToolbar: () => {
        throw new Error('Render failed');
      }
    }));
    
    const { container } = render(<StagewiseWrapper />);
    
    await waitFor(() => {
      // Should render nothing due to error
      expect(container.firstChild).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Stagewise rendering error:', expect.any(Error));
    });
    
    consoleSpy.mockRestore();
  });
});