import { Amplify } from 'aws-amplify';

// 1. 判断当前是否为本地开发环境，这是核心的切换逻辑
const isLocal = import.meta.env.DEV;

// 2. 定义基础配置
const config = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || '', 
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || '',
    },
  },
  API: {
    REST: {
      'PlacesAPI': {
        // 使用环境变量，不提供默认值
        endpoint: import.meta.env.VITE_API_BASE_URL || '',
        region: 'ap-southeast-1',
      },
    },
  },
};

// 3. 如果是本地环境，则为Auth部分动态添加本地endpoint
// 🔧 TEMPORARILY DISABLED for cloud testing - connect directly to AWS Cognito
// if (isLocal) {
//   config.Auth.Cognito['endpoint'] = 'http://localhost:3006';
//   console.log('[Amplify Config] Auth endpoint overridden for local development:', config.Auth.Cognito['endpoint']);
// }

// 4. 验证必需的环境变量
if (!import.meta.env.VITE_COGNITO_USER_POOL_ID || !import.meta.env.VITE_COGNITO_CLIENT_ID) {
  console.error('❌ [Amplify] 错误：缺少必需的 Cognito 环境变量');
  console.error('请确保设置了以下环境变量：');
  console.error('- VITE_COGNITO_USER_POOL_ID');
  console.error('- VITE_COGNITO_CLIENT_ID');
  throw new Error('Missing required Cognito configuration');
}

if (!import.meta.env.VITE_API_BASE_URL) {
  console.error('❌ [Amplify] 错误：缺少必需的 API 环境变量');
  console.error('请确保设置了 VITE_API_BASE_URL');
  throw new Error('Missing required API configuration');
}

// 5. 使用最终生成的配置初始化Amplify
Amplify.configure(config);

// 添加全局错误处理
if (typeof window !== 'undefined') {
  console.log('🔧 [Amplify] 配置已加载:', {
    userPoolId: config.Auth.Cognito.userPoolId,
    clientId: config.Auth.Cognito.userPoolClientId,
    apiEndpoint: config.API.REST.PlacesAPI.endpoint,
  });
}

export default config; 