import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const AuthCallback: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔗 Processing auth callback...');
        
        // Get the session from the URL
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
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Verifying Your Email
            </h2>
            <p className="text-gray-600">
              Please wait while we verify your email address...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Email Verified!
            </h2>
            <p className="text-gray-600 mb-4">
              {message}
            </p>
            <div className="text-sm text-gray-500">
              You can now sign in to your account.
            </div>
          </>
        )}

        {status === 'error' && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;