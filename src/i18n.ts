import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

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
    
    // 默认的命名空间
    defaultNS: 'common',

    // 配置语言检测器
    detection: {
      // 检测顺序，从左到右依次尝试
      order: ['cookie', 'localStorage', 'navigator', 'htmlTag'],
      // 缓存用户选择的语言到哪些地方
      caches: ['cookie', 'localStorage'],
    },

    // 配置http-backend
    backend: {
      // 翻译文件的加载路径
      // {{lng}} 会被替换为语言代码 (en, zh, ...)
      // {{ns}} 会被替换为命名空间 (common, ...)
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    // 在开发模式下开启debug输出
    debug: process.env.NODE_ENV === 'development',

    // react-i18next的特定配置
    react: {
      useSuspense: true, // 建议与React.Suspense一起使用
    },
  });

export default i18n;