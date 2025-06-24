// 调试组件：显示环境变量和API配置
import React from 'react';

const DebugEnv: React.FC = () => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3006/dev';
  
  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      right: 0, 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: '10px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h3>Debug Info</h3>
      <p><strong>VITE_API_BASE_URL:</strong> {import.meta.env.VITE_API_BASE_URL || 'undefined'}</p>
      <p><strong>API_BASE_URL used:</strong> {apiBaseUrl}</p>
      <p><strong>Mode:</strong> {import.meta.env.MODE}</p>
      <p><strong>DEV:</strong> {import.meta.env.DEV ? 'true' : 'false'}</p>
      <p><strong>PROD:</strong> {import.meta.env.PROD ? 'true' : 'false'}</p>
    </div>
  );
};

export default DebugEnv;