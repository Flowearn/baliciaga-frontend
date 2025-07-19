// This utility checks if i18n is properly loaded
import i18n from '../i18n';

export const checkI18nStatus = () => {
  const status = {
    isInitialized: i18n.isInitialized,
    language: i18n.language,
    languages: i18n.languages,
    hasBackend: !!i18n.modules.backend,
    backendOptions: i18n.options.backend,
    resourcesLoaded: Object.keys(i18n.store?.data || {}).length > 0,
    commonNamespaceExists: i18n.hasLoadedNamespace('common'),
    testTranslation: i18n.t('search.title'),
    store: i18n.store?.data,
  };
  
  console.log('[i18n Status Check]', status);
  
  // Also check if we can manually load
  if (!status.resourcesLoaded && i18n.modules.backend) {
    console.log('[i18n] Attempting manual backend load...');
    i18n.loadNamespaces(['common'], (err) => {
      if (err) {
        console.error('[i18n] Manual load failed:', err);
      } else {
        console.log('[i18n] Manual load successful');
        console.log('[i18n] After load - test translation:', i18n.t('search.title'));
      }
    });
  }
  
  return status;
};

// Check on module load
setTimeout(() => {
  checkI18nStatus();
}, 1000);