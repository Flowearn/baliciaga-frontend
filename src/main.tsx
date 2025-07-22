import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client'
import { Authenticator, ThemeProvider } from '@aws-amplify/ui-react';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx'
import './index.css'
// 导入amplify配置，配置在amplify-config.ts中已经完成
import './amplify-config'
import './i18n'
import './utils/i18nChecker'
import { AuthProvider } from './context/AuthContext';
import { ArchiveProvider } from './context/ArchiveContext';
import { baliciagaAmplifyTheme } from './theme/amplify-theme';
import { Analytics } from '@vercel/analytics/react';
import I18nSuspenseWrapper from './components/I18nSuspenseWrapper';

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <ThemeProvider theme={baliciagaAmplifyTheme}>
        <Authenticator.Provider>
          <AuthProvider>
            <ArchiveProvider>
              <I18nSuspenseWrapper>
                <App />
              </I18nSuspenseWrapper>
              <Analytics />
            </ArchiveProvider>
          </AuthProvider>
        </Authenticator.Provider>
      </ThemeProvider>
    </HelmetProvider>
  </React.StrictMode>
);
// Force redeploy 2025年 7月 7日 星期一 18时29分34秒 WITA
