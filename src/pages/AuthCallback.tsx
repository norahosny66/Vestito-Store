import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle, AlertCircle, Loader2, Lock, Eye, EyeOff } from 'lucide-react';

const AuthCallback: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'password-reset'>('loading');
  const [message, setMessage] = useState('');
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔗 Processing auth callback...');
        console.log('🔍 Current URL:', window.location.href);
        console.log('🔍 URL params:', Object.fromEntries(searchParams.entries()));
        console.log('🔍 URL hash:', window.location.hash);
        
        // Get all possible parameters that indicate password reset
        const type = searchParams.get('type');
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        // Also check hash parameters (Supabase sometimes puts tokens in hash)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const hashType = hashParams.get('type');
        const hashAccessToken = hashParams.get('access_token');
        const hashRefreshToken = hashParams.get('refresh_token');
        const hashError = hashParams.get('error');
        
        console.log('🔍 Hash params:', Object.fromEntries(hashParams.entries()));
        
        // Use hash parameters if query parameters are not available
        const finalType = type || hashType;
        const finalAccessToken = accessToken || hashAccessToken;
        const finalRefreshToken = refreshToken || hashRefreshToken;
        const finalError = error || hashError;
        
        console.log('🔍 Final params:', {
          type: finalType,
          hasAccessToken: !!finalAccessToken,
          hasRefreshToken: !!finalRefreshToken,
          error: finalError
        });
        
        // Check for error first
        if (finalError) {
          console.error('❌ Auth callback error from URL:', finalError, errorDescription);
          setStatus('error');
          setMessage(errorDescription || finalError);
          return;
        }
        
        // Check if this is a password reset callback
        const isPasswordReset = finalType === 'recovery' || 
                               finalType === 'password_recovery' ||
                               window.location.href.includes('type=recovery') ||
                               window.location.href.includes('password_recovery');
        
        console.log('🔐 Is password reset?', isPasswordReset);
        
        if (isPasswordReset) {
          console.log('🔐 Password reset callback detected');
          console.log('🔍 Reset tokens present:', { 
            accessToken: !!finalAccessToken, 
            refreshToken: !!finalRefreshToken 
          });
          
          if (!finalAccessToken || !finalRefreshToken) {
            console.error('❌ Missing tokens for password reset');
            setStatus('error');
            setMessage('Invalid password reset link. The link may be expired or malformed. Please request a new password reset.');
            return;
          }

          try {
            console.log('🔐 Setting session for password reset...');
            
            // Set the session with the tokens from the URL
            const { data, error: sessionError } = await supabase.auth.setSession({
              access_token: finalAccessToken,
              refresh_token: finalRefreshToken,
            });

            if (sessionError) {
              console.error('❌ Error setting session for password reset:', sessionError.message);
              setStatus('error');
              setMessage('Invalid or expired reset link. Please request a new password reset.');
              return;
            }

            if (data.session && data.user) {
              console.log('✅ Password reset session established for user:', data.user.email);
              setStatus('password-reset');
              setMessage('Please enter your new password below.');
              
              // Clear the URL hash to prevent issues
              window.history.replaceState({}, document.title, window.location.pathname);
            } else {
              console.error('❌ No session established for password reset');
              setStatus('error');
              setMessage('Unable to establish reset session. Please try again.');
            }
          } catch (sessionError) {
            console.error('❌ Session setup error:', sessionError);
            setStatus('error');
            setMessage('Failed to process reset link. Please try again.');
          }
          return;
        }
        
        // Handle regular auth callback (email verification, sign-in, etc.)
        console.log('📧 Processing regular auth callback...');
        
        // Try to exchange the code for a session
        const { data, error: authError } = await supabase.auth.exchangeCodeForSession(
          window.location.href
        );
        
        if (authError) {
          console.error('❌ Auth callback error:', authError.message);
          
          // If code exchange fails, try getting existing session
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError || !sessionData.session) {
            setStatus('error');
            setMessage(authError.message || 'Authentication failed. Please try signing in again.');
            return;
          }
          
          // Use existing session
          console.log('✅ Using existing session');
          await handleSuccessfulAuth(sessionData.session, sessionData.user);
          return;
        }

        if (data.session && data.user) {
          console.log('✅ Auth callback successful for user:', data.user.email);
          await handleSuccessfulAuth(data.session, data.user);
        } else {
          console.log('⚠️ No session found in callback');
          setStatus('error');
          setMessage('No active session found. Please try signing in again.');
        }
      } catch (error) {
        console.error('❌ Callback processing error:', error);
        setStatus('error');
        setMessage('An error occurred during authentication. Please try again.');
      }
    };

    const handleSuccessfulAuth = async (session: any, user: any) => {
      try {
        // Check if this is email verification
        if (user.email_confirmed_at) {
          setStatus('success');
          setMessage('Email verified successfully! Redirecting...');
        } else {
          setStatus('success');
          setMessage('Authentication successful! Redirecting...');
        }
        
        // Create user profile if it doesn't exist
        try {
          const { data: existingProfile } = await supabase
            .from('User')
            .select('*')
            .eq('email', user.email!)
            .maybeSingle();

          if (!existingProfile) {
            console.log('👤 Creating user profile...');
            
            const firstName = user.user_metadata?.first_name || user.email?.split('@')[0] || 'User';
            const secondName = user.user_metadata?.second_name || '';
            
            const { error: profileError } = await supabase
              .from('User')
              .insert([
                {
                  email: user.email!,
                  first_name: firstName,
                  second_name: secondName,
                }
              ]);

            if (profileError) {
              console.error('❌ Error creating user profile:', profileError.message);
            } else {
              console.log('✅ User profile created successfully');
            }
          }
        } catch (profileError) {
          console.error('❌ Profile creation error:', profileError);
        }
        
        // Redirect to home page after a short delay
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 2000);
      } catch (error) {
        console.error('❌ Error handling successful auth:', error);
        setStatus('error');
        setMessage('Authentication succeeded but profile creation failed. Please try signing in.');
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams]);

  const validatePassword = (password: string) => {
    const errors = [];
    if (password.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('One number');
    return errors;
  };

  const passwordErrors = validatePassword(newPassword);
  const isPasswordValid = passwordErrors.length === 0 && newPassword.length > 0;
  const doPasswordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isPasswordValid) {
      setResetError('Please meet all password requirements');
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match');
      return;
    }

    setResetLoading(true);
    setResetError(null);

    try {
      console.log('🔐 Updating password...');
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('❌ Password update error:', error.message);
        setResetError(error.message);
      } else {
        console.log('✅ Password updated successfully');
        setStatus('success');
        setMessage('Password updated successfully! You can now sign in with your new password.');
        
        // Sign out the user so they can sign in with new password
        await supabase.auth.signOut();
        
        // Redirect to home page after a short delay
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 3000);
      }
    } catch (error) {
      console.error('❌ Password reset error:', error);
      setResetError('Failed to update password. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {status === 'loading' && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Processing Request
            </h2>
            <p className="text-gray-600">
              Please wait while we process your authentication...
            </p>
          </div>
        )}

        {status === 'password-reset' && (
          <div>
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white text-center">
              <Lock className="w-12 h-12 mx-auto mb-4 opacity-90" />
              <h2 className="text-2xl font-bold mb-2">
                Reset Your Password
              </h2>
              <p className="opacity-90">
                Create a new secure password for your account
              </p>
            </div>

            {/* Form */}
            <div className="p-6">
              <form onSubmit={handlePasswordReset} className="space-y-6">
                {resetError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <p className="text-red-700 text-sm font-medium">{resetError}</p>
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
                      disabled={resetLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  {/* Password Requirements */}
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-medium text-gray-700">Password must contain:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { label: 'At least 8 characters', valid: newPassword.length >= 8 },
                        { label: 'One uppercase letter', valid: /[A-Z]/.test(newPassword) },
                        { label: 'One lowercase letter', valid: /[a-z]/.test(newPassword) },
                        { label: 'One number', valid: /[0-9]/.test(newPassword) }
                      ].map((req, index) => (
                        <div key={index} className={`flex items-center space-x-1 ${
                          req.valid ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            req.valid ? 'bg-green-500' : 'bg-gray-300'
                          }`} />
                          <span>{req.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
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
                      disabled={resetLoading}
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
                      <p className="text-blue-800 text-sm font-medium">Secure Password Tips</p>
                      <p className="text-blue-700 text-xs mt-1">
                        Use a unique password that you don't use elsewhere. Consider using a password manager.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={resetLoading || !isPasswordValid || !doPasswordsMatch}
                  className="w-full bg-blue-500 text-white font-semibold py-4 px-6 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 text-lg"
                >
                  {resetLoading ? (
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
        )}

        {status === 'success' && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {message.includes('Password') ? 'Password Updated!' : 'Success!'}
            </h2>
            <p className="text-gray-600 mb-6">
              {message}
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700 text-sm">
                {message.includes('Password') 
                  ? '🎉 You can now sign in with your new password. Redirecting you to the homepage...' 
                  : '🎉 Redirecting you to the homepage...'
                }
              </p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Something Went Wrong
            </h2>
            <p className="text-gray-600 mb-6">
              {message}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/', { replace: true })}
                className="w-full px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
              >
                Return to Home
              </button>
              <p className="text-xs text-gray-500">
                Need help? Contact support or try requesting a new reset link.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;