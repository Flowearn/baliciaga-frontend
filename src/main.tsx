import React from 'react';
import { createRoot } from 'react-dom/client'
import { Authenticator } from '@aws-amplify/ui-react';
import App from './App.tsx'
import './index.css'
// 导入amplify配置，配置在amplify-config.ts中已经完成
import './amplify-config'
import { AuthProvider } from './context/AuthContext';

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Authenticator.Provider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Authenticator.Provider>
  </React.StrictMode>
);
