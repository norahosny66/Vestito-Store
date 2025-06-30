import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { supabase, getAuthRedirectUrl } from '../lib/supabase';

const ResetPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('🔐 Sending password reset email to:', email);
      
      const redirectUrl = getAuthRedirectUrl();
      console.log('🔗 Using redirect URL for password reset:', redirectUrl);
      
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

  if (success) {
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
          <form onSubmit={handleSubmit} className="space-y-6">
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