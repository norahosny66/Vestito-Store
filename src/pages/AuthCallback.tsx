import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle, AlertCircle, Loader2, Lock } from 'lucide-react';

const AuthCallback: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'password-reset'>('loading');
  const [message, setMessage] = useState('');
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔗 Processing auth callback...');
        
        // Check if this is a password reset callback
        const type = searchParams.get('type');
        
        if (type === 'recovery') {
          console.log('🔐 Password reset callback detected');
          setStatus('password-reset');
          setMessage('Please enter your new password below.');
          return;
        }
        
        // Handle email verification
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Auth callback error:', error.message);
          setStatus('error');
          setMessage(error.message);
          return;
        }

        if (data.session) {
          console.log('✅ Email verification successful');
          setStatus('success');
          setMessage('Email verified successfully! Redirecting to sign in...');
          
          // Create user profile if it doesn't exist
          const user = data.session.user;
          if (user) {
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
          }
          
          // Redirect to home page after a short delay
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 2000);
        } else {
          console.log('⚠️ No session found in callback');
          setStatus('error');
          setMessage('No session found. Please try signing up again.');
        }
      } catch (error) {
        console.error('❌ Callback processing error:', error);
        setStatus('error');
        setMessage('An error occurred during verification. Please try again.');
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setResetError('Password must be at least 6 characters long');
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
        setMessage('Password updated successfully! Redirecting to sign in...');
        
        // Redirect to home page after a short delay
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 2000);
      }
    } catch (error) {
      console.error('❌ Password reset error:', error);
      setResetError('Failed to update password. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        {status === 'loading' && (
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Verifying Your Email
            </h2>
            <p className="text-gray-600">
              Please wait while we verify your email address...
            </p>
          </div>
        )}

        {status === 'password-reset' && (
          <div>
            <div className="text-center mb-6">
              <Lock className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Reset Your Password
              </h2>
              <p className="text-gray-600">
                {message}
              </p>
            </div>

            <form onSubmit={handlePasswordReset} className="space-y-4">
              {resetError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">{resetError}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter new password"
                    required
                    minLength={6}
                    disabled={resetLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm new password"
                    required
                    minLength={6}
                    disabled={resetLoading}
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-700 text-sm">
                  <strong>Password Requirements:</strong>
                  <br />• At least 6 characters long
                  <br />• Use a strong, unique password
                </p>
              </div>

              <button
                type="submit"
                disabled={resetLoading || !newPassword || !confirmPassword}
                className="w-full bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {resetLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {message.includes('Password') ? 'Password Updated!' : 'Email Verified!'}
            </h2>
            <p className="text-gray-600 mb-4">
              {message}
            </p>
            <div className="text-sm text-gray-500">
              {message.includes('Password') 
                ? 'You can now sign in with your new password.' 
                : 'You can now sign in to your account.'
              }
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Verification Failed
            </h2>
            <p className="text-gray-600 mb-4">
              {message}
            </p>
            <button
              onClick={() => navigate('/', { replace: true })}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Return to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;