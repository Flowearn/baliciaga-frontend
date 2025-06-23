import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { confirmSignUpCode } from '@/services/authService';
import { resendSignUpCode } from 'aws-amplify/auth';

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

const ConfirmSignUpPage = () => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [bgColor, setBgColor] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get email from navigation state
  const email = location.state?.email || '';

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

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      toast.error('No email provided. Please sign up first.');
      navigate('/signup');
    }
  }, [email, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code) {
      toast.error('Please enter the verification code');
      return;
    }

    if (code.length !== 6) {
      toast.error('Verification code must be 6 digits');
      return;
    }

    setIsLoading(true);
    try {
      // Confirm sign up with the code
      const result = await confirmSignUpCode(email, code);

      console.log('Confirmation result:', result);
      
      if (result.success) {
        toast.success('Email verified successfully! You can now sign in.');
        navigate('/login', { state: { email } });
      } else {
        toast.error(result.error || 'Verification failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Confirmation error:', error);
      toast.error('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      await resendSignUpCode({ username: email });
      toast.success('New verification code sent to your email!');
    } catch (error) {
      console.error('Resend code error:', error);
      toast.error('Failed to resend code. Please try again.');
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
        <h1 className="text-center text-2xl font-bold text-white mb-2">Verify your email</h1>
        <p className="text-center text-white/70 mb-6">
          We've sent a verification code to {email}
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm text-white/70 mb-2">
              Enter 6-digit code
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => {
                // Only allow digits and limit to 6 characters
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setCode(value);
              }}
              className="w-full rounded-lg bg-white/10 px-4 py-3 text-white placeholder-white/50 focus:bg-white/15 focus:outline-none text-center text-2xl tracking-wider"
              placeholder="000000"
              maxLength={6}
              autoComplete="one-time-code"
              inputMode="numeric"
              pattern="[0-9]{6}"
              required
            />
          </div>
          
          <Button 
            type="submit"
            disabled={isLoading || code.length !== 6}
            className="w-full h-12 bg-[#B7AC93] hover:bg-[#c6b89b] text-white rounded-3xl text-lg font-semibold"
          >
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </Button>
        </form>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={handleResendCode}
            disabled={isLoading}
            className="text-[#B7AC93] hover:text-[#c6b89b] text-sm font-medium"
          >
            Didn't receive the code? Resend
          </button>
        </div>
        
        <div className="text-center text-base text-white/70 mt-6">
          Wrong email?{' '}
          <button
            onClick={() => navigate('/signup')}
            className="text-[#B7AC93] hover:text-[#c6b89b] font-semibold"
          >
            Go back to sign up
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmSignUpPage;