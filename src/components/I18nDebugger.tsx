import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

const I18nDebugger: React.FC = () => {
  const { t, ready } = useTranslation('common');
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const info = {
      ready: ready,
      language: i18n.language,
      languages: i18n.languages,
      isInitialized: i18n.isInitialized,
      hasLoadedNamespace: i18n.hasLoadedNamespace('common'),
      searchTitle: t('search.title'),
      searchPlaceholder: t('searchPlaceholder'),
      rawSearchTitle: i18n.t('search.title'),
      store: i18n.store?.data,
      options: {
        backend: i18n.options.backend,
        fallbackLng: i18n.options.fallbackLng,
        defaultNS: i18n.options.defaultNS,
      }
    };
    
    setDebugInfo(info);
    
    // Log to console
    console.log('[I18n Debugger] Current state:', info);
  }, [ready, t]);

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: 0, 
      right: 0, 
      background: 'black', 
      color: 'white', 
      padding: '10px',
      maxWidth: '400px',
      maxHeight: '300px',
      overflow: 'auto',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 9999
    }}>
      <h3>i18n Debug Info</h3>
      <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
    </div>
  );
};

export default I18nDebugger;