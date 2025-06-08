import axios from 'axios';
import { fetchAuthSession } from 'aws-amplify/auth';

// API Gateway基础URL - 从dev-rent stage获取
const API_BASE_URL = 'https://77z66u4qd6.execute-api.ap-southeast-1.amazonaws.com/dev-rent';

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
    try {
      // 获取当前用户的认证token
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();
      
      if (idToken) {
        // 添加Authorization header
        config.headers.Authorization = `Bearer ${idToken}`;
      }
    } catch (error) {
      // 如果用户未登录，继续发送请求（对于公开端点）
      console.log('User not authenticated, proceeding without auth token');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理常见错误
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
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