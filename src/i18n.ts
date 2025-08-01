import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Debug logging function
const debugLog = (message: string, data?: unknown) => {
  console.log(`[i18n Debug] ${message}`, data || '');
};

i18n
  // 注入http-backend插件，用于从服务器加载翻译文件
  .use(HttpApi)
  // 注入浏览器语言检测插件
  .use(LanguageDetector)
  // 将i18n实例传递给react-i18next
  .use(initReactI18next)
  // 初始化i18next
  .init({
    // 支持的语言列表
    supportedLngs: ['en', 'zh', 'ru', 'ko'],
    
    // 后备语言，当当前语言没有对应的翻译时使用
    fallbackLng: 'en',
    
    // 允许非精确匹配（如 zh-CN 匹配 zh）
    nonExplicitSupportedLngs: true,
    
    // 默认的命名空间
    defaultNS: 'common',
    // 后备命名空间，当请求的命名空间不存在时使用
    fallbackNS: 'common',
    // 明确指定只使用 common 命名空间
    ns: ['common'],

    // 配置语言检测器
    detection: {
      // a. 检测顺序：先查localStorage，再查浏览器
      order: ['localStorage', 'navigator'],
      
      // b. 在localStorage中缓存用户选择的语言
      caches: ['localStorage']
    },

    // 配置http-backend
    backend: {
      // 翻译文件的加载路径
      // {{lng}} 会被替换为语言代码 (en, zh, ...)
      // {{ns}} 会被替换为命名空间 (common, ...)
      loadPath: (lngs, namespaces) => {
        // 从 i18next 提供的语言码数组中，获取最优先的一个 (例如 'zh-TW')
        const lang = lngs[0];
        // 提取基础语言码 (例如 'zh')
        const baseLang = lang.split('-')[0];
        const ns = namespaces[0];
        let path: string;
        
        // 根据真实文件结构构建正确的路径
        if (ns === 'common') {
          // common.json 在所有语言目录中都没有语言后缀
          path = `/locales/${baseLang}/common.json`;
        } else if (baseLang === 'en') {
          // 英语文件使用 ${ns}.en.json 格式 (除了 common.json)
          path = `/locales/en/${ns}.en.json`;
        } else {
          // 其他语言文件使用 ${ns}.${lang}.json 格式 (除了 common.json)
          path = `/locales/${baseLang}/${ns}.${baseLang}.json`;
        }
        
        debugLog(`Loading translation file: ${path}`, { lang, baseLang, ns });
        return path;
      },
      
      // Add request interceptor for debugging
      requestOptions: {
        mode: 'cors',
        credentials: 'same-origin',
        cache: 'no-cache',
      },
      
      // Add custom request function for debugging
      request: (options, url, payload, callback) => {
        debugLog(`Fetching translation from: ${url}`);
        
        fetch(url, options)
          .then(response => {
            debugLog(`Response status for ${url}: ${response.status}`);
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
          })
          .then(data => {
            debugLog(`Successfully loaded ${url}, size: ${data.length} bytes`);
            callback(null, { status: 200, data });
          })
          .catch(error => {
            debugLog(`Failed to load ${url}:`, error);
            callback(error, { status: 500, data: null });
          });
      },
    },

    // 强制开启debug输出以进行问题诊断
    debug: true,

    // react-i18next的特定配置
    react: {
      useSuspense: true, // 启用 suspense 模式以消除翻译闪烁
    },
  })
  .then(() => {
    debugLog('i18n initialized successfully');
    debugLog('Current language:', i18n.language);
    debugLog('Available languages:', i18n.languages);
  })
  .catch((error) => {
    debugLog('i18n initialization failed:', error);
  });

export default i18n;