import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

// Loading component for i18n initialization
const I18nLoadingFallback: React.FC = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background-creamy">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-xl font-semibold text-gray-700">Loading translations...</p>
        <p className="text-base text-gray-500 mt-2">Preparing the application for you</p>
      </div>
    </div>
  );
};

// Wrapper component that ensures i18n is ready before rendering children
const I18nSuspenseWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Suspense fallback={<I18nLoadingFallback />}>
      <I18nInitializer>
        {children}
      </I18nInitializer>
    </Suspense>
  );
};

// Component that forces i18n initialization and throws promise for Suspense
const I18nInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // This will throw a promise if i18n is not ready, causing Suspense to show fallback
  const { ready } = useTranslation('common');
  
  // If translations are not ready, this component will suspend
  if (!ready) {
    // This should not happen with Suspense, but adding as fallback
    return <I18nLoadingFallback />;
  }
  
  return <>{children}</>;
};

export default I18nSuspenseWrapper;