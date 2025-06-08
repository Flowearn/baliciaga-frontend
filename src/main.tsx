import React from 'react';
import { createRoot } from 'react-dom/client'
import { Amplify } from 'aws-amplify';
import App from './App.tsx'
import './index.css'
import amplifyConfig from './amplify-config'

// 配置Amplify
Amplify.configure(amplifyConfig);

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
