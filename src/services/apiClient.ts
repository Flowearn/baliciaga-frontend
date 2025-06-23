import axios from 'axios';
import { fetchAuthSession } from 'aws-amplify/auth';

// API Gateway基础URL - 根据环境变量自动切换
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3006/dev';

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 自动添加认证token
apiClient.interceptors.request.use(
  async (config) => {
    console.log('[API Client] Request interceptor - URL:', config.url);
    try {
      // 获取当前用户的认证token
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();
      
      if (idToken) {
        // 添加Authorization header
        config.headers.Authorization = `Bearer ${idToken}`;
        console.log('[API Client] Added auth token');
      } else {
        console.log('[API Client] No auth token found');
      }

      // --- NEW: Add dynamic user headers for local development ---
      if (import.meta.env.DEV) {
        try {
          const { getCurrentUser } = await import('aws-amplify/auth');
          const currentUser = await getCurrentUser();
          const userSub = currentUser.userId;
          const userEmail = currentUser.signInDetails?.loginId;

          if (userSub) {
            // --- 关键诊断日志 (前端部分) ---
            console.log(
              `%c[FRONTEND-AUTH-DIAGNOSIS] Interceptor sending header x-test-user-sub: ${userSub}`,
              'color: orange; font-weight: bold;'
            );
            // ------------------------------------
            config.headers['x-test-user-sub'] = userSub;
            config.headers['x-test-user-email'] = userEmail || '';
            // For testing, check if user has InternalStaff group
            try {
              const { isInternalStaff } = await import('@/utils/authUtils');
              const isStaff = await isInternalStaff();
              if (isStaff) {
                config.headers['x-test-user-groups'] = 'InternalStaff';
              }
            } catch (staffCheckError) {
              console.log('Could not check InternalStaff status:', staffCheckError);
            }
          }
        } catch (e) {
          // User might not be logged in, that's okay.
          // The backend will handle the case where headers are missing.
        }
      }
      // -----------------------------------------------------------
    } catch (error) {
      // 如果用户未登录，继续发送请求（对于公开端点）
      console.log('User not authenticated, proceeding without auth token');
    }
    
    return config;
  },
  (error) => {
    console.error('[API Client] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理常见错误
apiClient.interceptors.response.use(
  (response) => {
    console.log('[API Client] Response received:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('[API Client] Response error:', error);
    console.error('[API Client] Error code:', error.code);
    console.error('[API Client] Error message:', error.message);
    
    if (error.code === 'ERR_NETWORK') {
      console.error('[API Client] Network error - request failed to reach server');
      console.error('[API Client] Request URL:', error.config?.url);
      console.error('[API Client] Request headers:', error.config?.headers);
    }
    
    if (error.response?.status === 401) {
      console.error('Unauthorized access - please login again');
      // 可以在这里触发重新登录流程
    } else if (error.response?.status === 403) {
      console.error('Forbidden access - insufficient permissions');
    } else if (error.response?.status >= 500) {
      console.error('Server error - please try again later');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;

// 便利的API方法
export const api = {
  // 场所相关API
  places: {
    getAll: () => apiClient.get('/places'),
    getById: (placeId: string) => apiClient.get(`/places/${placeId}`),
  },
  
  // 用户相关API
  users: {
    getProfile: () => apiClient.get('/users/me'),
    getApplications: () => apiClient.get('/users/me/applications'),
  },
  
  // 房源相关API
  listings: {
    getAll: () => apiClient.get('/listings'),
    getById: (listingId: string) => apiClient.get(`/listings/${listingId}`),
    create: (listingData: Record<string, unknown>) => apiClient.post('/listings', listingData),
    getApplications: (listingId: string) => apiClient.get(`/listings/${listingId}/applications`),
    createApplication: (listingId: string, applicationData: Record<string, unknown>) => 
      apiClient.post(`/listings/${listingId}/applications`, applicationData),
  },
  
  // 申请相关API
  applications: {
    update: (applicationId: string, updateData: Record<string, unknown>) => 
      apiClient.put(`/applications/${applicationId}`, updateData),
  },
}; 