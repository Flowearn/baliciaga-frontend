import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client'
import { Authenticator, ThemeProvider } from '@aws-amplify/ui-react';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx'
import './index.css'
// 导入amplify配置，配置在amplify-config.ts中已经完成
import './amplify-config'
import './i18n'
import { AuthProvider } from './context/AuthContext';
import { ArchiveProvider } from './context/ArchiveContext';
import { baliciagaAmplifyTheme } from './theme/amplify-theme';
import { Analytics } from '@vercel/analytics/react';

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Suspense fallback={<div>Loading translations...</div>}>
      <HelmetProvider>
        <ThemeProvider theme={baliciagaAmplifyTheme}>
          <Authenticator.Provider>
            <AuthProvider>
              <ArchiveProvider>
                <App />
                <Analytics />
              </ArchiveProvider>
            </AuthProvider>
          </Authenticator.Provider>
        </ThemeProvider>
      </HelmetProvider>
    </Suspense>
  </React.StrictMode>
);
// Force redeploy 2025年 7月 7日 星期一 18时29分34秒 WITA
