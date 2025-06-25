import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useThemeStore } from '@/stores/useThemeStore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { signInWithPassword } from '@/services/authService';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Eye, EyeOff } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { checkCurrentUser, user } = useAuth();
  
  // Immersive header color management
  const setImmersiveTheme = useThemeStore((state) => state.setImmersiveTheme);

  // Check if user is already logged in
  useEffect(() => {
    if (user) {
      // User is already logged in, redirect to home or intended destination
      const redirectTo = new URLSearchParams(location.search).get('redirect') || '/';
      navigate(redirectTo, { replace: true });
    }
  }, [user, navigate, location.search]);

  useEffect(() => {
    // 为所有这些页面设置统一的深色主题
    const pageThemeColor = '#FFFFFF'; 
    setImmersiveTheme({ backgroundColor: pageThemeColor, foregroundColor: '#FFFFFF' });

    // 关键的清理函数，在离开页面时恢复默认颜色
    return () => {
      setImmersiveTheme(null);
    };
  }, [setImmersiveTheme]);
  
  // Get email from navigation state (if coming from signup)
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  // Set random background color on mount
  useEffect(() => {
    const randomColor = pantoneBackgroundColors[Math.floor(Math.random() * pantoneBackgroundColors.length)];
    setBgColor(randomColor);
  }, []);

  // Control body overflow to prevent scrollbar
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || email.trim() === '') {
      toast.error('Please enter your email');
      return;
    }

    if (!password) {
      toast.error('Please enter your password');
      return;
    }

    setIsLoading(true);
    try {
      const trimmedEmail = email.trim();
      console.log('🔐 Signing in:', trimmedEmail);
      
      // Sign in with password
      const result = await signInWithPassword(trimmedEmail, password);
      
      if (result.success) {
        console.log('✅ Login successful');
        toast.success('Login successful!');
        
        // Refresh auth context to update user state
        await checkCurrentUser();
        
        // Navigate to profile or redirect URL
        const redirectTo = new URLSearchParams(location.search).get('redirect') || '/profile';
        navigate(redirectTo, { replace: true });
      } else if (result.needsConfirmation) {
        console.log('📧 Email confirmation needed');
        toast.error('Please verify your email first');
        navigate('/confirm-signup', { state: { email: trimmedEmail } });
      } else {
        console.error('❌ Login failed:', result.error);
        toast.error(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Error during login:', error);
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
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none"></div>

      {/* Form container */}
      <div className="relative w-full max-w-md bg-black/40 backdrop-blur-sm rounded-xl p-6 shadow-lg text-white/90 z-20">
        <h1 className="text-center text-2xl font-bold text-white mb-6">Sign in</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-white/10 px-4 py-3 text-white placeholder-white/50 focus:bg-white/15 focus:outline-none"
              placeholder="Email"
              required
              autoComplete="email"
            />
          </div>
          
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-white/10 px-4 py-3 pr-12 text-white placeholder-white/50 focus:bg-white/15 focus:outline-none"
              placeholder="Password"
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80 focus:outline-none"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
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
        
        <div className="text-center text-base text-white/70 mt-6 space-y-2">
          <div>
            <Link 
              to="/forgot-password" 
              className="text-[#B7AC93] hover:text-[#c6b89b] font-medium"
            >
              Forgot Password?
            </Link>
          </div>
          <div>
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
    </div>
  );
};

export default LoginPage;