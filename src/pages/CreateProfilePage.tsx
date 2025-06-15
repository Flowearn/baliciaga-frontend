import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserProfileForm from '../features/rentals/components/UserProfileForm';
import { toast } from 'sonner';

const CreateProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, setUser, checkCurrentUser } = useAuth();

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }

    // 🔧 修复：只有当用户明确有完整资料时才重定向，避免误判
    if (user?.profile?.name && user?.profile?.whatsApp) {
      navigate('/', { replace: true });
      return;
    }
  }, [user, isAuthenticated, navigate]);

  const handleProfileCreated = async () => {
    try {
      console.log("Profile created successfully, now refreshing auth context...");
      await checkCurrentUser(); // 强制刷新全局用户状态
      console.log("Auth context refreshed!");
      
      toast.success('Welcome to Baliciaga!');
      navigate('/profile', { replace: true }); // 现在可以直接、自信地跳转到Profile页面
    } catch (error) {
      console.error('Error after profile creation:', error);
      toast.error('Failed to refresh profile. Please refresh the page.');
    }
  };

  // Don't render anything while checking auth/profile status
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <UserProfileForm onProfileCreated={handleProfileCreated} />
    </div>
  );
};

export default CreateProfilePage; 