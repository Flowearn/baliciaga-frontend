import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { signInWithPassword } from '@/services/authService';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

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

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [bgColor, setBgColor] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { checkCurrentUser } = useAuth();

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
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔐 Starting login with Cognito:', { email });
      
      // Call real Cognito authentication
      const result = await signInWithPassword(email, password);
      
      if (result.success) {
        console.log('✅ Login successful:', result);
        toast.success('Login successful!');
        
        // Refresh auth context to update user state
        await checkCurrentUser();
        
        // Get redirect destination from URL params
        const urlParams = new URLSearchParams(location.search);
        const redirectTo = urlParams.get('redirect') || '/profile';
        
        console.log('🔄 Redirecting to:', redirectTo);
        navigate(redirectTo);
      } else {
        console.error('❌ Login failed:', result.error);
        toast.error(result.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      toast.error('Login failed. Please try again.');
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
        <h1 className="text-center text-2xl font-bold text-white mb-6">Sign in</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg bg-white/10 px-4 py-3 text-white placeholder-white/50 focus:bg-white/15 focus:outline-none"
            placeholder="Email"
            required
          />
          
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg bg-white/10 px-4 py-3 text-white placeholder-white/50 focus:bg-white/15 focus:outline-none"
            placeholder="Password"
            required
          />
          
          <Button 
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-[#B7AC93] hover:bg-[#c6b89b] text-white rounded-3xl text-lg font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </Button>
        </form>
        
        <div className="text-center text-base text-white/70 mt-6">
          Don't have an account?{' '}
          <Link 
            to="/signup" 
            className="text-[#B7AC93] hover:text-[#c6b89b] font-semibold"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 