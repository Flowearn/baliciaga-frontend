import { Amplify } from 'aws-amplify';

// 1. 判断当前是否为本地开发环境，这是核心的切换逻辑
const isLocal = import.meta.env.DEV;

// 2. 定义基础配置
const config = {
  Auth: {
    Cognito: {
      userPoolId: 'ap-southeast-1_N72jBBIzH', 
      userPoolClientId: '3n9so3j4rlh21mebhjo39nperk',
    },
  },
  API: {
    REST: {
      'PlacesAPI': {
        // 复用相同的逻辑，如果环境变量存在则使用，否则回退到本地
        endpoint: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3006/dev',
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

// 4. 使用最终生成的配置初始化Amplify
Amplify.configure(config);

// 添加全局错误处理
if (typeof window !== 'undefined') {
  console.log('🔧 [Amplify] 配置已加载:', {
    userPoolId: config.Auth.Cognito.userPoolId,
    clientId: config.Auth.Cognito.userPoolClientId,
  });
}

export default config; 