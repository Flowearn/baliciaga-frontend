// frontend/src/components/ProtectedRoute.tsx

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // 导入我们自己的hook

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  // 使用我们自己的、可靠的状态
  const { isAuthenticated, isAuthLoading } = useAuth();
  const location = useLocation();

  console.log('[ProtectedRoute]', { isAuthenticated, isAuthLoading });

  // 在我们自己的context检查状态时，显示加载
  if (isAuthLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div>Loading Auth session...</div>
      </div>
    );
  }
  
  // 使用我们自己的状态来做判断
  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${location.pathname}${location.search}`} replace />;
  }

  return children;
} 