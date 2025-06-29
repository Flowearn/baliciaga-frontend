import React from 'react';
import { createRoot } from 'react-dom/client'
import { Authenticator, ThemeProvider } from '@aws-amplify/ui-react';
import App from './App.tsx'
import './index.css'
// 导入amplify配置，配置在amplify-config.ts中已经完成
import './amplify-config'
import { AuthProvider } from './context/AuthContext';
import { ArchiveProvider } from './context/ArchiveContext';
import { baliciagaAmplifyTheme } from './theme/amplify-theme';

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={baliciagaAmplifyTheme}>
      <Authenticator.Provider>
        <AuthProvider>
          <ArchiveProvider>
            <App />
          </ArchiveProvider>
        </AuthProvider>
      </Authenticator.Provider>
    </ThemeProvider>
  </React.StrictMode>
);
