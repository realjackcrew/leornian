import { useState, useEffect } from 'react';
import { register as registerApi, googleAuth } from '../api/auth';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User } from 'lucide-react';
import EmailVerification from '../components/EmailVerification';
import { getErrorMessage, createRetryFunction } from '../utils/errorUtils';
export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');
  const isEmailVerified = !!verificationToken;
  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleSignIn
      });
      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        { 
          theme: 'outline', 
          size: 'large',
          width: '100%',
          text: 'signup_with'
        }
      );
    }
  }, []);
  const handleGoogleSignIn = async (response) => {
    setIsLoading(true);
    try {
      const googleAuthWithRetry = createRetryFunction(googleAuth, 2000);
      const res = await googleAuthWithRetry(response.credential, false);
      alert('Registration successful! Please log in.');
      navigate('/login');
    } catch (error) {
      console.error('Google sign-in error:', error);
      const msg = getErrorMessage(error, 'Google registration failed');
      alert(msg);
    } finally {
      setIsLoading(false);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const registerWithRetry = createRetryFunction(registerApi, 2000);
      await registerWithRetry(email, password, firstName, lastName, verificationToken);
      alert('Registration successful! Please log in.');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      const msg = getErrorMessage(error, 'Registration failed');
      alert(msg);
    } finally {
      setIsLoading(false);
    }
  };
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient-xy opacity-25">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient-xy-reverse opacity-25"></div>
      </div>
      {}
      <div className="absolute inset-0 bg-white/10 dark:bg-black/20"></div>
      {}
      <div className="max-w-md w-full space-y-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-white/20 dark:border-gray-700/50 relative z-10">
        <div className="text-center">
          <h2 className="text-3xl font-light text-gray-900 dark:text-white">Create an account</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Join Leornian today</p>
        </div>
        {}
        {!isEmailVerified ? (
          <>
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                  disabled={isLoading}
                />
              </div>
              <EmailVerification
                email={email}
                purpose="register"
                onVerified={setVerificationToken}
                disabled={!email || isLoading}
              />
            </div>
            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white/90 dark:bg-gray-900/90 text-gray-500 dark:text-gray-400">Or register with</span>
              </div>
            </div>
            <div id="google-signin-button" className="w-full mt-4"></div>
            <div className="text-center mt-6">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4 text-center">
              <div className="text-lg font-semibold text-gray-800 dark:text-white">Verified email:</div>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300 break-all">{email}</div>
            </div>
            <form onSubmit={handleSubmit} className="mt-4 space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    type="text"
                    placeholder="First name"
                    value={capitalize(firstName)}
                    onChange={e => setFirstName(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    type="text"
                    placeholder="Last name"
                    value={capitalize(lastName)}
                    onChange={e => setLastName(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center space-x-2 py-2 px-4 border border-transparent rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all ${
                  isLoading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                <UserPlus className="h-5 w-5" />
                <span>{isLoading ? 'Creating account...' : 'Create account'}</span>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}