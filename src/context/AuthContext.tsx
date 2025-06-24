// frontend/src/context/AuthContext.tsx

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Hub } from 'aws-amplify/utils';
import { getCurrentUser, fetchUserAttributes, AuthUser, signOut } from 'aws-amplify/auth';
import { fetchUserProfile, UserProfile } from '../services/userService';

// 扩展的用户类型，合并Amplify AuthUser和我们的UserProfile
export type ExtendedUser = AuthUser & Partial<UserProfile> & {
  sub: string; // Cognito User ID，用于身份验证和所有权判断
  email?: string; // 用户邮箱，来自Cognito或后端数据库
};

interface AuthContextType {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  user: ExtendedUser | null;
  setUser: (user: ExtendedUser | null) => void;
  checkCurrentUser: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isAuthLoading: true,
  user: null,
  setUser: () => {},
  checkCurrentUser: async () => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [user, setUser] = useState<ExtendedUser | null>(null);

  // 将checkCurrentUser函数移到useEffect外面，这样可以在Provider value中暴露
  const checkCurrentUser = async () => {
    setIsAuthLoading(true);
    try {
      console.log('🔍 [AuthContext] 开始检查当前用户...');
      const authenticatedUser = await getCurrentUser();
      
      // 获取用户属性（包括email）
      const userAttributes = await fetchUserAttributes();
      console.log('📧 [AuthContext] 用户属性:', userAttributes);
      
      // 尝试获取用户的完整业务资料
      try {
        const profileData = await fetchUserProfile();
        console.log('👤 [AuthContext] 后端用户资料:', profileData);
        
        // 合并Amplify用户数据和业务资料，确保包含所有必要的身份字段
        const fullUserObject: ExtendedUser = {
          ...authenticatedUser,
          ...profileData,
          // 确保 sub (Cognito User ID) 可用，这是关键的身份标识符
          sub: authenticatedUser.userId, // Amplify v6 中，userId 就是 Cognito sub
          // 确保email字段可用 - 优先使用后端的email，其次使用Cognito的email
          email: profileData.email || userAttributes.email || authenticatedUser.username,
        };
        
        console.log('✅ [AuthContext] 完整用户对象:', fullUserObject);
        setIsAuthenticated(true);
        setUser(fullUserObject);
      } catch (profileError) {
        // 如果获取资料失败（比如新用户还没创建资料），只使用基础认证数据
        const basicUserObject: ExtendedUser = {
          ...authenticatedUser,
          sub: authenticatedUser.userId, // 确保即使在基础对象中也包含 sub
          // 从Cognito属性中获取email
          email: userAttributes.email || authenticatedUser.username,
        };
        
        console.log('✅ [AuthContext] 基础用户对象:', basicUserObject);
        setIsAuthenticated(true);
        setUser(basicUserObject);
      }
    } catch (error: any) {
      console.log('🔍 [AuthContext] getCurrentUser错误:', error?.name, error?.message);
      // 不要将这个错误视为严重错误，用户可能只是未登录
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsAuthLoading(false);
    }
  };

  // 添加signOut函数
  const handleSignOut = async () => {
    try {
      await signOut();
      setIsAuthenticated(false);
      setUser(null);
      
      // 清除本地存储的认证信息
      localStorage.removeItem('currentVerificationEmail');
      
      // 重定向到登录页
      window.location.href = '/login';
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  useEffect(() => {
    // 1. 监听认证事件（登录、退出）
    const hubListener = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signedIn':
          checkCurrentUser(); // 更新用户状态和对象
          break;
        case 'signedOut':
          setIsAuthenticated(false);
          setUser(null);
          break;
      }
    });

    // 2. 检查当前会话状态（用于页面刷新）
    checkCurrentUser();

    // 3. 组件卸载时移除监听器
    return () => {
      hubListener();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isAuthLoading, 
      user, 
      setUser, 
      checkCurrentUser,
      signOut: handleSignOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// 4. 创建一个自定义hook，方便其他组件使用
export const useAuth = () => useContext(AuthContext); 