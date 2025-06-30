import React, { useState } from 'react';
import { X, Mail, Lock, User, Loader2, CheckCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'signin' }) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'verification' | 'reset-sent'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationEmail, setVerificationEmail] = useState<string>('');
  const [resetEmailSent, setResetEmailSent] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signIn, signUp } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    secondName: '',
    confirmPassword: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        console.log('🔐 Starting sign-up process...');
        const { error } = await signUp(
          formData.email,
          formData.password,
          formData.firstName,
          formData.secondName
        );

        if (error) {
          console.error('❌ Sign-up error:', error.message);
          setError(error.message);
        } else {
          console.log('✅ Sign-up successful, showing verification message');
          setVerificationEmail(formData.email);
          setMode('verification');
        }
      } else {
        console.log('🔐 Starting sign-in process...');
        const { error } = await signIn(formData.email, formData.password);

        if (error) {
          console.error('❌ Sign-in error:', error.message);
          setError(error.message);
        } else {
          console.log('✅ Sign-in successful');
          onClose();
        }
      }
    } catch (err) {
      console.error('❌ Unexpected error:', err);
      setError('An unexpected error occurred');
    }

    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!formData.email.trim()) {
      setError('Please enter your email address first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔐 Sending password reset email to:', formData.email);
      
      const redirectUrl = `${window.location.origin}/reset-password`;
      console.log('🔗 Using redirect URL:', redirectUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        console.error('❌ Password reset error:', error.message);
        setError(error.message);
      } else {
        console.log('✅ Password reset email sent successfully');
        setResetEmailSent(formData.email);
        setMode('reset-sent');
      }
    } catch (err) {
      console.error('❌ Password reset error:', err);
      setError('Failed to send reset email. Please try again.');
    }

    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      firstName: '',
      secondName: '',
      confirmPassword: ''
    });
    setError(null);
  };

  const switchMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    resetForm();
  };

  const handleBackToSignIn = () => {
    setMode('signin');
    resetForm();
    setVerificationEmail('');
    setResetEmailSent('');
  };

  // Password reset email sent screen
  if (mode === 'reset-sent') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-plum-600 to-plum-500 p-8 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-playfair font-bold mb-2">Check Your Email</h2>
            <p className="opacity-90">Password reset link sent</p>
          </div>

          <div className="p-8 text-center space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-plum-800 mb-3">
                Reset Link Sent Successfully
              </h3>
              
              <p className="text-gray-600 mb-4">
                A password reset link has been sent to:
              </p>
              
              <div className="bg-plum-50 rounded-2xl p-4 mb-6">
                <p className="font-medium text-plum-800">{resetEmailSent}</p>
              </div>
              
              <div className="space-y-3 text-sm text-gray-600 mb-6">
                <p>Please check your email and click the reset link to set a new password.</p>
                <p>The link will expire in 1 hour for security reasons.</p>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleBackToSignIn}
                className="w-full bg-gradient-to-r from-plum-600 to-plum-500 text-white font-semibold py-4 px-6 rounded-2xl hover:from-plum-500 hover:to-plum-400 transition-all duration-200 transform hover:scale-105"
              >
                Back to Sign In
              </button>
              
              <button
                onClick={onClose}
                className="w-full text-gray-600 hover:text-plum-600 font-medium py-2"
              >
                Close
              </button>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Didn't receive the email? Check your spam folder or try again.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Email verification success screen
  if (mode === 'verification') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-rosegold-500 to-rosegold-400 p-8 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-playfair font-bold mb-2">Account Created!</h2>
            <p className="opacity-90">Welcome to Vestito</p>
          </div>

          <div className="p-8 text-center space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-plum-800 mb-3">
                Verification Email Sent
              </h3>
              
              <p className="text-gray-600 mb-4">
                We've sent a verification email to:
              </p>
              
              <div className="bg-rosegold-50 rounded-2xl p-4 mb-6">
                <p className="font-medium text-plum-800">{verificationEmail}</p>
              </div>
              
              <div className="space-y-3 text-sm text-gray-600 mb-6">
                <p>Please check your email and click the verification link to activate your account.</p>
                <p>Once verified, you can sign in and start customizing your fashion pieces!</p>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleBackToSignIn}
                className="w-full bg-gradient-to-r from-rosegold-500 to-rosegold-400 text-white font-semibold py-4 px-6 rounded-2xl hover:from-rosegold-400 hover:to-rosegold-300 transition-all duration-200 transform hover:scale-105"
              >
                Continue to Sign In
              </button>
              
              <button
                onClick={onClose}
                className="w-full text-gray-600 hover:text-plum-600 font-medium py-2"
              >
                Close
              </button>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Didn't receive the email? Check your spam folder or contact support.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-plum-600 to-plum-500 p-8 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-playfair font-bold">
              {mode === 'signin' ? 'Welcome Back' : 'Join Vestito'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-white/90">
            {mode === 'signin' 
              ? 'Sign in to your account to continue customizing' 
              : 'Create your account and start your fashion journey'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {mode === 'signup' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-plum-800 mb-3">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-plum-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-plum-100 focus:border-plum-500 transition-all duration-200 font-medium"
                    placeholder="John"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-plum-800 mb-3">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-plum-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.secondName}
                    onChange={(e) => setFormData({ ...formData, secondName: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-plum-100 focus:border-plum-500 transition-all duration-200 font-medium"
                    placeholder="Doe"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-plum-800 mb-3">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-plum-400 w-5 h-5" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-plum-100 focus:border-plum-500 transition-all duration-200 font-medium"
                placeholder="john@example.com"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-plum-800 mb-3">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-plum-400 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-plum-100 focus:border-plum-500 transition-all duration-200 font-medium"
                placeholder="••••••••"
                required
                minLength={6}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-plum-400 hover:text-plum-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-semibold text-plum-800 mb-3">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-plum-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-plum-100 focus:border-plum-500 transition-all duration-200 font-medium"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-plum-400 hover:text-plum-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <div className="bg-gradient-to-r from-plum-50 to-rosegold-50 border border-plum-200 rounded-2xl p-4">
              <p className="text-plum-700 text-sm">
                <strong>Note:</strong> You'll receive a verification email after creating your account. 
                Please verify your email before signing in.
              </p>
            </div>
          )}

          {/* Forgot Password Link - Only show on sign in */}
          {mode === 'signin' && (
            <div className="text-right">
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={loading}
                className="text-sm text-plum-600 hover:text-plum-700 font-medium disabled:opacity-50 transition-colors"
              >
                {loading ? 'Sending...' : 'Forgot your password?'}
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-plum-600 to-plum-500 text-white font-semibold py-4 px-6 rounded-2xl hover:from-plum-500 hover:to-plum-400 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-3 shadow-lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{mode === 'signin' ? 'Signing In...' : 'Creating Account...'}</span>
              </>
            ) : (
              <span className="text-lg">{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
            )}
          </button>

          <div className="text-center pt-4">
            <p className="text-gray-600">
              {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={switchMode}
                disabled={loading}
                className="text-plum-600 hover:text-plum-700 font-semibold disabled:opacity-50 transition-colors"
              >
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;