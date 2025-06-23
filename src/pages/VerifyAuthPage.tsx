import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { verifyCode } from '@/services/authService';
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

const VerifyAuthPage = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [bgColor, setBgColor] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { checkCurrentUser } = useAuth();
  
  const email = location.state?.email || localStorage.getItem('currentVerificationEmail') || '';
  const redirectTo = location.state?.redirect || '/profile';

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

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      toast.error('No email found. Please start over.');
      navigate('/login');
    }
  }, [email, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter a 6-digit verification code');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔐 Verifying code for:', email);
      
      const result = await verifyCode(verificationCode);
      
      if (result.success) {
        console.log('✅ Verification successful');
        toast.success('Login successful!');
        
        // Refresh auth context to update user state
        await checkCurrentUser();
        
        // Clear stored email
        localStorage.removeItem('currentVerificationEmail');
        
        console.log('🔄 Redirecting to:', redirectTo);
        navigate(redirectTo);
      } else {
        console.error('❌ Verification failed:', result.error);
        toast.error(result.error || 'Invalid verification code');
      }
    } catch (error) {
      console.error('❌ Verification error:', error);
      toast.error('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    navigate('/login', { state: { email } });
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      {/* 蒙版层 */}
      <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none"></div>

      {/* 表单容器层 */}
      <div className="relative w-full max-w-md bg-black/40 backdrop-blur-sm rounded-xl p-6 shadow-lg text-white/90 z-20">
        <h1 className="text-center text-2xl font-bold text-white mb-2">Enter verification code</h1>
        <p className="text-center text-white/70 mb-6">
          We sent a 6-digit code to <br />
          <span className="font-semibold">{email}</span>
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                if (value.length <= 6) {
                  setVerificationCode(value);
                }
              }}
              className="w-full rounded-lg bg-white/10 px-4 py-3 text-white placeholder-white/50 focus:bg-white/15 focus:outline-none text-center text-xl tracking-wider"
              placeholder="000000"
              maxLength={6}
              required
              autoFocus
            />
            <p className="text-xs text-white/60 mt-2 text-center">
              {email.endsWith('@test.com') ? 'Test mode: Use 123456' : 'Check your email for the code'}
            </p>
          </div>
          
          <Button 
            type="submit"
            disabled={isLoading || verificationCode.length !== 6}
            className="w-full h-12 bg-[#B7AC93] hover:bg-[#c6b89b] text-white rounded-3xl text-lg font-semibold disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify & Sign in'
            )}
          </Button>
        </form>
        
        <div className="text-center text-base text-white/70 mt-6">
          Didn't receive the code?{' '}
          <button 
            onClick={handleResendCode}
            className="text-[#B7AC93] hover:text-[#c6b89b] font-semibold"
          >
            Resend code
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyAuthPage;