import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { requestPasswordReset } from '@/services/authService';
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

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [bgColor, setBgColor] = useState('');
  const navigate = useNavigate();

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
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || email.trim() === '') {
      toast.error('Please enter your email');
      return;
    }

    setIsLoading(true);
    try {
      const trimmedEmail = email.trim();
      console.log('🔑 Requesting password reset for:', trimmedEmail);
      
      const result = await requestPasswordReset(trimmedEmail);
      
      if (result.success) {
        console.log('✅ Reset code sent successfully');
        toast.success('Reset code sent to your email!');
        
        // Store email for reset page
        localStorage.setItem('resetPasswordEmail', trimmedEmail);
        
        // Navigate to reset password page
        navigate('/reset-password', { state: { email: trimmedEmail } });
      } else {
        console.error('❌ Failed to send reset code:', result.error);
        toast.error(result.error || 'Failed to send reset code');
      }
    } catch (error) {
      console.error('❌ Error during password reset request:', error);
      toast.error('Failed to send reset code. Please try again.');
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
        <h1 className="text-center text-2xl font-bold text-white mb-2">Forgot Password?</h1>
        <p className="text-center text-white/70 mb-6">
          Enter your email and we'll send you a code to reset your password.
        </p>
        
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
              autoFocus
            />
          </div>
          
          <Button 
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-[#B7AC93] hover:bg-[#c6b89b] text-white rounded-3xl text-lg font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending reset code...
              </>
            ) : (
              'Send Reset Code'
            )}
          </Button>
        </form>
        
        <div className="text-center text-base text-white/70 mt-6 space-y-2">
          <div>
            Remember your password?{' '}
            <Link 
              to="/login" 
              className="text-[#B7AC93] hover:text-[#c6b89b] font-semibold"
            >
              Sign in
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

export default ForgotPasswordPage;