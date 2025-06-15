import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAuthenticator } from '@aws-amplify/ui-react';
// 假设 AmplifyAuthenticator 和其他UI组件从这里导入
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css'; 

export function AccountPage() {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const { authStatus } = useAuthenticator();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect');

  // 监听认证状态变化，区分注册和登录
  useEffect(() => {
    console.log('[AccountPage] Auth status changed to:', authStatus);
    
    if (authStatus === 'authenticated') {
      // 如果有重定向路径，优先使用；否则跳转到创建个人资料页面
      const targetPath = redirectPath || '/create-profile';
      console.log('[AccountPage] User authenticated - redirecting to:', targetPath);
      navigate(targetPath, { replace: true });
    }
      }, [authStatus, navigate, redirectPath]);

  if (isAuthLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (isAuthenticated || authStatus === 'authenticated') {
    return null; // 在等待跳转时，不渲染任何内容
  }

  // 仅在未登录时渲染 Amplify 的登录/注册UI
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Authenticator />
    </div>
  );
}

export default AccountPage;
