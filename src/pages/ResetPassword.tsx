import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { supabase, getAuthRedirectUrl } from '../lib/supabase';

const ResetPassword: React.FC = () => {
  const [mode, setMode] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const checkForPasswordReset = async () => {
      try {
        console.log('🔍 Checking for password reset parameters...');
        console.log('🔍 Current URL:', window.location.href);
        console.log('🔍 Search params:', Object.fromEntries(searchParams.entries()));
        console.log('🔍 Hash:', window.location.hash);

        // Check URL parameters for password reset
        const type = searchParams.get('type');
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        
        // Also check hash parameters (Supabase sometimes puts tokens in hash)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const hashType = hashParams.get('type');
        const hashAccessToken = hashParams.get('access_token');
        const hashRefreshToken = hashParams.get('refresh_token');
        
        console.log('🔍 Hash params:', Object.fromEntries(hashParams.entries()));
        
        // Use hash parameters if query parameters are not available
        const finalType = type || hashType;
        const finalAccessToken = accessToken || hashAccessToken;
        const finalRefreshToken = refreshToken || hashRefreshToken;
        
        console.log('🔍 Final detection:', {
          type: finalType,
          hasAccessToken: !!finalAccessToken,
          hasRefreshToken: !!finalRefreshToken
        });

        // Check if this is a password reset callback
        const isPasswordReset = finalType === 'recovery' || 
                               finalType === 'password_recovery' ||
                               window.location.href.includes('type=recovery') ||
                               window.location.href.includes('password_recovery');

        if (isPasswordReset && finalAccessToken && finalRefreshToken) {
          console.log('🔐 Password reset detected, setting up session...');
          
          // Set the session for password reset
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: finalAccessToken,
            refresh_token: finalRefreshToken,
          });

          if (sessionError) {
            console.error('❌ Session error:', sessionError.message);
            setError('Invalid or expired reset link. Please request a new password reset.');
            return;
          }

          if (data.session && data.user) {
            console.log('✅ Password reset session established for:', data.user.email);
            setMode('reset');
            
            // Clear the URL to prevent issues
            window.history.replaceState({}, document.title, '/reset-password');
          } else {
            console.error('❌ No session established');
            setError('Unable to establish reset session. Please try again.');
          }
        } else {
          console.log('📧 No password reset detected, showing email form');
          setMode('request');
        }
      } catch (error) {
        console.error('❌ Error checking password reset:', error);
        setError('An error occurred. Please try again.');
      }
    };

    checkForPasswordReset();
  }, [searchParams]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('🔐 Sending password reset email to:', email);
      
      const redirectUrl = `${window.location.origin}/reset-password`;
      console.log('🔗 Using redirect URL:', redirectUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        console.error('❌ Password reset error:', error.message);
        setError(error.message);
      } else {
        console.log('✅ Password reset email sent successfully');
        setSuccess(true);
      }
    } catch (err) {
      console.error('❌ Password reset error:', err);
      setError('Failed to send reset email. Please try again.');
    }

    setLoading(false);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔐 Updating password...');
      
      // Update the user's password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('❌ Password update error:', error.message);
        setError(error.message);
        setLoading(false);
        return;
      }

      console.log('✅ Password updated successfully');
      
      // Sign out the user immediately
      console.log('👋 Signing out user...');
      await supabase.auth.signOut();
      
      // Show success and redirect
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 3000);

    } catch (err) {
      console.error('❌ Password reset error:', err);
      setError('Failed to update password. Please try again.');
      setLoading(false);
    }
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const isPasswordValid = validatePassword(newPassword);
  const doPasswordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  // Success state for email sent
  if (success && mode === 'request') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-blue-500" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Check Your Email
            </h2>
            
            <p className="text-gray-600 mb-4">
              We've sent a password reset link to:
            </p>
            
            <div className="bg-gray-50 rounded-lg p-3 mb-6">
              <p className="font-medium text-gray-900">{email}</p>
            </div>
            
            <div className="space-y-3 text-sm text-gray-600 mb-6">
              <p>Click the link in your email to reset your password.</p>
              <p>The link will expire in 1 hour for security reasons.</p>
            </div>

            <div className="space-y-3">
              <Link
                to="/"
                className="block w-full bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors text-center"
              >
                Return to Home
              </Link>
              
              <p className="text-xs text-gray-500">
                Didn't receive the email? Check your spam folder.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state for password reset
  if (success && mode === 'reset') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Password Reset Complete!
            </h2>
            
            <p className="text-gray-600 mb-6">
              Your password has been reset successfully. Please sign in with your new password.
            </p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-700 text-sm">
                🎉 You can now sign in with your new password. Redirecting you to the sign in page...
              </p>
            </div>

            <Link
              to="/"
              className="block w-full bg-green-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors text-center"
            >
              Go to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Password reset form (when user clicks email link)
  if (mode === 'reset') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
            <Lock className="w-12 h-12 mx-auto mb-4 opacity-90" />
            <h2 className="text-2xl font-bold text-center mb-2">
              Set New Password
            </h2>
            <p className="text-center opacity-90">
              Create a new secure password for your account
            </p>
          </div>

          {/* Form */}
          <div className="p-6">
            <form onSubmit={handlePasswordReset} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                </div>
              )}

              {/* New Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
                      newPassword && !isPasswordValid 
                        ? 'border-red-300 focus:ring-red-500' 
                        : newPassword && isPasswordValid
                        ? 'border-green-300 focus:ring-green-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="Enter new password"
                    required
                    disabled={loading}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                <p className="mt-2 text-xs text-gray-500">
                  Password must be at least 6 characters long
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
                      confirmPassword && !doPasswordsMatch 
                        ? 'border-red-300 focus:ring-red-500' 
                        : confirmPassword && doPasswordsMatch
                        ? 'border-green-300 focus:ring-green-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="Confirm new password"
                    required
                    disabled={loading}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {confirmPassword && (
                  <div className={`mt-2 text-xs flex items-center space-x-1 ${
                    doPasswordsMatch ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      doPasswordsMatch ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <span>{doPasswordsMatch ? 'Passwords match' : 'Passwords do not match'}</span>
                  </div>
                )}
              </div>

              {/* Security Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Lock className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-blue-800 text-sm font-medium">Security Notice</p>
                    <p className="text-blue-700 text-xs mt-1">
                      After updating your password, you'll be signed out and need to sign in again with your new password.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !isPasswordValid || !doPasswordsMatch}
                className="w-full bg-blue-500 text-white font-semibold py-4 px-6 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Email request form (default)
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <Link
              to="/"
              className="p-1 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h2 className="text-2xl font-bold">Reset Password</h2>
          </div>
          <p className="opacity-90">
            Enter your email address and we'll send you a secure link to reset your password.
          </p>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="john@example.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-700 text-sm">
                <strong>How it works:</strong><br />
                We'll send you a secure link that will redirect you to our website where you can safely set a new password.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Reset Link...</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  <span>Send Reset Link</span>
                </>
              )}
            </button>

            <div className="text-center pt-4">
              <p className="text-gray-600">
                Remember your password?{' '}
                <Link
                  to="/"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Back to Sign In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;