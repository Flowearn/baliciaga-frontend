import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { confirmPasswordReset } from '@/services/authService';
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

const ResetPasswordPage = () => {
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [bgColor, setBgColor] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email from navigation state or localStorage
  const email = location.state?.email || localStorage.getItem('resetPasswordEmail') || '';

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
      navigate('/forgot-password');
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

    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔐 Resetting password for:', email);
      
      const result = await confirmPasswordReset(email, code, newPassword);
      
      if (result.success) {
        console.log('✅ Password reset successful');
        toast.success('Password reset successfully! You can now sign in with your new password.');
        
        // Clear stored email
        localStorage.removeItem('resetPasswordEmail');
        
        // Navigate to login page with email
        navigate('/login', { state: { email } });
      } else {
        console.error('❌ Password reset failed:', result.error);
        toast.error(result.error || 'Failed to reset password');
      }
    } catch (error) {
      console.error('❌ Error during password reset:', error);
      toast.error('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = () => {
    // Navigate back to forgot password page with email
    navigate('/forgot-password', { state: { email } });
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
        <h1 className="text-center text-2xl font-bold text-white mb-2">Reset Password</h1>
        <p className="text-center text-white/70 mb-6">
          Enter the 6-digit code sent to <br />
          <span className="font-semibold">{email}</span>
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm text-white/70 mb-2">
              Verification Code
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
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm text-white/70 mb-2">
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg bg-white/10 px-4 py-3 text-white placeholder-white/50 focus:bg-white/15 focus:outline-none"
              placeholder="Enter new password"
              required
              minLength={8}
              autoComplete="new-password"
            />
            <p className="text-xs text-white/50 mt-1">
              At least 8 characters with uppercase, lowercase and numbers
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm text-white/70 mb-2">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg bg-white/10 px-4 py-3 text-white placeholder-white/50 focus:bg-white/15 focus:outline-none"
              placeholder="Confirm new password"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          
          <Button 
            type="submit"
            disabled={isLoading || code.length !== 6}
            className="w-full h-12 bg-[#B7AC93] hover:bg-[#c6b89b] text-white rounded-3xl text-lg font-semibold disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Resetting password...
              </>
            ) : (
              'Reset Password'
            )}
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
      </div>
    </div>
  );
};

export default ResetPasswordPage;