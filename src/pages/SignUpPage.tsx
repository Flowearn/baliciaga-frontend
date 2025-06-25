import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useThemeStore } from '@/stores/useThemeStore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// Pantone background colors from CafeDetailPage
const pantoneBackgroundColors = [
  '#F0F1E3', // PANTONE 11-4302 Cannoli Cream
  '#DFC9B8', // PANTONE 13-1108 Cream Tan
  '#B7AC93', // PANTONE 15-1116 Safari
  '#BDA08A', // PANTONE 15-1317 Sirocco
  '#9E7B66', // PANTONE 17-1230 Mocha Mousse
  '#9E8977', // PANTONE 16-1414 Chanterelle
  '#86675B', // PANTONE 18-1421 Baltic Amber
  '#534540'  // PANTONE 19-1216 Chocolate Martini
];

const SignUpPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [bgColor, setBgColor] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Immersive header color management
  const setImmersiveTheme = useThemeStore((state) => state.setImmersiveTheme);

  // Check if user is already logged in
  useEffect(() => {
    if (user) {
      // User is already logged in, redirect to home
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    // 为所有这些页面设置统一的深色主题
    const pageThemeColor = '#FFFFFF'; 
    setImmersiveTheme({ backgroundColor: pageThemeColor, foregroundColor: '#FFFFFF' });

    // 关键的清理函数，在离开页面时恢复默认颜色
    return () => {
      setImmersiveTheme(null);
    };
  }, [setImmersiveTheme]);

  // Set random background color on mount
  useEffect(() => {
    const randomColor = pantoneBackgroundColors[Math.floor(Math.random() * pantoneBackgroundColors.length)];
    setBgColor(randomColor);
  }, []);

  // Control body overflow to prevent scrollbar
  useEffect(() => {
    // 组件挂载时，强制隐藏 body 的滚动条
    document.body.style.overflow = 'hidden';

    // 组件卸载时，返回一个清理函数，恢复 body 的滚动能力
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [location]); // 依赖 location，确保 URL 变化时重新执行

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    try {
      // Import the signUpWithPassword function
      const { signUpWithPassword } = await import('@/services/authService');
      
      // Call the sign up function
      const result = await signUpWithPassword(email, password);
      
      if (result.success) {
        console.log('Registration successful, need email confirmation');
        toast.success('Registration successful! Please check your email for verification code.');
        // Navigate to confirmation page with email as state
        navigate('/confirm-signup', { state: { email } });
      } else {
        toast.error(result.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      {/* 新增的蒙版层 */}
      <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none"></div>

      {/* 表单容器层，确保有 z-20 */}
      <div className="relative w-full max-w-md bg-black/40 backdrop-blur-sm rounded-xl p-6 shadow-lg text-white/90 z-20">
        <h1 className="text-center text-2xl font-bold text-white mb-6">Sign up</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg bg-white/10 px-4 py-3 text-white placeholder-white/50 focus:bg-white/15 focus:outline-none"
            placeholder="Email"
            required
          />
          
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-white/10 px-4 py-3 pr-12 text-white placeholder-white/50 focus:bg-white/15 focus:outline-none"
              placeholder="Password"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80 focus:outline-none"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg bg-white/10 px-4 py-3 pr-12 text-white placeholder-white/50 focus:bg-white/15 focus:outline-none"
              placeholder="Confirm Password"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80 focus:outline-none"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          <Button 
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-[#B7AC93] hover:bg-[#c6b89b] text-white rounded-3xl text-lg font-semibold"
          >
            {isLoading ? 'Creating account...' : 'Sign up'}
          </Button>
        </form>
        
        <div className="text-center text-base text-white/70 mt-6">
          Already have an account?{' '}
          <Link 
            to="/login" 
            className="text-[#B7AC93] hover:text-[#c6b89b] font-semibold"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage; 