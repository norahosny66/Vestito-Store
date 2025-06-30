import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const AuthCallback: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔗 Processing auth callback...');
        console.log('🔍 Current URL:', window.location.href);
        console.log('🔍 URL params:', Object.fromEntries(searchParams.entries()));
        console.log('🔍 URL hash:', window.location.hash);
        
        // Get all possible parameters
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
        
        // Check if this is a password reset callback - redirect to reset page
        const isPasswordReset = finalType === 'recovery' || 
                               finalType === 'password_recovery' ||
                               window.location.href.includes('type=recovery') ||
                               window.location.href.includes('password_recovery');
        
        console.log('🔐 Is password reset?', isPasswordReset);
        
        if (isPasswordReset) {
          console.log('🔐 Password reset detected, redirecting to reset page...');
          
          // Build the complete URL with all parameters preserved
          const resetUrl = new URL('/reset-password', window.location.origin);
          
          // Copy all search parameters to the reset URL
          searchParams.forEach((value, key) => {
            resetUrl.searchParams.set(key, value);
          });
          
          // Also preserve hash if it exists
          if (window.location.hash) {
            resetUrl.hash = window.location.hash;
          }
          
          console.log('🔗 Redirecting to reset page with URL:', resetUrl.toString());
          
          // Use replace to avoid back button issues
          window.location.replace(resetUrl.toString());
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

        {status === 'success' && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Success!
            </h2>
            <p className="text-gray-600 mb-6">
              {message}
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700 text-sm">
                🎉 Redirecting you to the homepage...
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