import React, { useState } from 'react';
import { X, Mail, Lock, User, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'signin' }) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'verification' | 'forgot-password' | 'reset-sent'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationEmail, setVerificationEmail] = useState<string>('');
  const [resetEmail, setResetEmail] = useState<string>('');
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
          // Show verification screen
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('🔐 Sending password reset email to:', resetEmail);
      
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });

      if (error) {
        console.error('❌ Password reset error:', error.message);
        setError(error.message);
      } else {
        console.log('✅ Password reset email sent successfully');
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
    setResetEmail('');
  };

  const switchMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    resetForm();
  };

  const handleBackToSignIn = () => {
    setMode('signin');
    resetForm();
    setVerificationEmail('');
  };

  const handleForgotPasswordClick = () => {
    setMode('forgot-password');
    setResetEmail(formData.email); // Pre-fill with current email if any
    setError(null);
  };

  const handleBackFromForgotPassword = () => {
    setMode('signin');
    setError(null);
  };

  // Password reset email sent screen
  if (mode === 'reset-sent') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Check Your Email</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Password Reset Email Sent
            </h3>
            
            <p className="text-gray-600 mb-4">
              We've sent a password reset link to:
            </p>
            
            <div className="bg-gray-50 rounded-lg p-3 mb-6">
              <p className="font-medium text-gray-900">{resetEmail}</p>
            </div>
            
            <div className="space-y-3 text-sm text-gray-600 mb-6">
              <p>Please check your email and click the reset link to create a new password.</p>
              <p>The link will expire in 1 hour for security reasons.</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleBackToSignIn}
                className="w-full bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Back to Sign In
              </button>
              
              <button
                onClick={onClose}
                className="w-full text-gray-600 hover:text-gray-800 font-medium"
              >
                Close
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Didn't receive the email? Check your spam folder or try again.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Forgot password form
  if (mode === 'forgot-password') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleBackFromForgotPassword}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-gray-600 mt-2">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleForgotPassword} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="john@example.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-blue-700 text-sm">
                <strong>Note:</strong> You'll receive an email with a link to reset your password. 
                The link will expire in 1 hour.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !resetEmail.trim()}
              className="w-full bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Reset Email...</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  <span>Send Reset Email</span>
                </>
              )}
            </button>

            <div className="text-center pt-4">
              <p className="text-gray-600">
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={handleBackFromForgotPassword}
                  disabled={loading}
                  className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                >
                  Back to Sign In
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Verification success screen
  if (mode === 'verification') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Check Your Email</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Account Created Successfully!
            </h3>
            
            <p className="text-gray-600 mb-4">
              We've sent a verification email to:
            </p>
            
            <div className="bg-gray-50 rounded-lg p-3 mb-6">
              <p className="font-medium text-gray-900">{verificationEmail}</p>
            </div>
            
            <div className="space-y-3 text-sm text-gray-600 mb-6">
              <p>Please check your email and click the verification link to activate your account.</p>
              <p>Once verified, you can sign in and start customizing your fashion pieces!</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleBackToSignIn}
                className="w-full bg-amber-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-amber-600 transition-colors"
              >
                Continue to Sign In
              </button>
              
              <button
                onClick={onClose}
                className="w-full text-gray-600 hover:text-gray-800 font-medium"
              >
                Close
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
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
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            {mode === 'signin' 
              ? 'Sign in to your account to continue' 
              : 'Join us to start customizing your fashion'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {mode === 'signup' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="John"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.secondName}
                      onChange={(e) => setFormData({ ...formData, secondName: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Doe"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="john@example.com"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="••••••••"
                required
                minLength={6}
                disabled={loading}
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-blue-700 text-sm">
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
                onClick={handleForgotPasswordClick}
                disabled={loading}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
              >
                Forgot your password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{mode === 'signin' ? 'Signing In...' : 'Creating Account...'}</span>
              </>
            ) : (
              <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
            )}
          </button>

          <div className="text-center pt-4">
            <p className="text-gray-600">
              {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={switchMode}
                disabled={loading}
                className="text-amber-600 hover:text-amber-700 font-medium disabled:opacity-50"
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