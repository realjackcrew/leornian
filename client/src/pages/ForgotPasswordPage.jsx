import { useState } from 'react';
import { requestPasswordReset, resetPassword } from '../api/auth';
import EmailVerification from '../components/EmailVerification';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getErrorMessage, createRetryFunction } from '../utils/errorUtils';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const isEmailVerified = !!verificationToken;
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      // Create a retry function that will wait 2 seconds before retrying on network errors
      const resetPasswordWithRetry = createRetryFunction(resetPassword, 2000);
      await resetPasswordWithRetry(email, newPassword, verificationToken);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to reset password');
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient-xy opacity-25">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient-xy-reverse opacity-25"></div>
      </div>
      
      {/* Background overlay */}
      <div className="absolute inset-0 bg-white/10 dark:bg-black/20"></div>

      {/* Content */}
      <div className="max-w-md w-full space-y-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-white/20 dark:border-gray-700/50 relative z-10">
        <div className="text-center">
          <button
            onClick={() => navigate('/login')}
            className="absolute top-4 left-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          
          <h2 className="text-3xl font-light text-gray-900 dark:text-white">Reset Password</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {isEmailVerified ? 'Enter your new password' : 'Enter your email to begin'}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {!isEmailVerified ? (
          <>
            <div className="space-y-4">
              <input
                className="block w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                disabled={isLoading}
              />
              <EmailVerification
                email={email}
                purpose="reset"
                onVerified={setVerificationToken}
                disabled={!email || isLoading}
              />
            </div>
            <div className="text-center mt-6">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Remembered your password?{' '}
                <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </>
        ) : success ? (
          <div className="text-green-700 text-center font-semibold text-lg">Password reset! Redirecting to login...</div>
        ) : (
          <>
            <div className="mb-4 text-center">
              <div className="text-lg font-semibold text-gray-800 dark:text-white">Verified email:</div>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300 break-all">{email}</div>
            </div>
            <form onSubmit={handleReset} className="space-y-6">
              <div className="relative">
                <input
                  className="block w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Resetting...' : 'Reset password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
} 