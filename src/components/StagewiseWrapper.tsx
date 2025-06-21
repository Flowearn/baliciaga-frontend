import React, { useEffect, useState } from 'react';
import { StagewiseToolbar } from '@stagewise/toolbar-react';
import { ReactPlugin } from '@stagewise-plugins/react';

/**
 * StagewiseWrapper - A simplified React wrapper component for Stagewise toolbar
 * 
 * This component safely integrates Stagewise toolbar with proper error handling
 * and cleanup to prevent conflicts with React's rendering system.
 */
const StagewiseWrapper: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  // Only show Stagewise in development or when explicitly enabled
  const shouldRender = import.meta.env.MODE === 'development' || 
                       import.meta.env.VITE_ENABLE_STAGEWISE === 'true';
  
  useEffect(() => {
    if (!shouldRender) return;
    
    // Only initialize once the component is mounted
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    
    // Cleanup function
    return () => {
      clearTimeout(timer);
      
      // Clean up any Stagewise-created elements
      const cleanupElements = [
        'stagewise-companion-anchor',
        'stagewise-toolbar',
        'stagewise-mount-point'
      ];
      
      cleanupElements.forEach(id => {
        const element = document.getElementById(id);
        if (element && element.parentElement) {
          try {
            element.parentElement.removeChild(element);
          } catch (error) {
            console.warn(`Failed to cleanup Stagewise element ${id}:`, error);
          }
        }
      });
      
      setIsReady(false);
      setHasError(false);
    };
  }, [shouldRender]);
  
  // Error boundary for Stagewise rendering
  const handleError = (error: Error) => {
    console.error('Stagewise rendering error:', error);
    setHasError(true);
  };
  
  // Don't render anything if shouldn't render, not ready, or has error
  if (!shouldRender || !isReady || hasError) {
    return null;
  }
  
  try {
    return (
      <StagewiseToolbar
        config={{
          plugins: [ReactPlugin],
        }}
        enabled={true}
      />
    );
  } catch (error) {
    handleError(error as Error);
    return null;
  }
};

export default StagewiseWrapper;