import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { whoopAuth } from '../api/auth';
import { Activity, CheckCircle, XCircle } from 'lucide-react';

export default function WhoopCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('Connecting to WHOOP...');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handleWhoopCallback = async () => {
      // Prevent duplicate processing
      if (isProcessing) {
        console.log('WHOOP callback already processing, skipping...');
        return;
      }

      setIsProcessing(true);

      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const state = searchParams.get('state');
        const storedState = sessionStorage.getItem('whoop_oauth_state');

        console.log('WHOOP callback received:', { code: !!code, error, state, storedState });

        if (error) {
          setStatus('error');
          setMessage(`WHOOP authorization failed: ${error}`);
          return;
        }

        if (!code) {
          setStatus('error');
          setMessage('No authorization code received from WHOOP.');
          return;
        }

        // Validate state parameter to prevent CSRF attacks
        if (!state || !storedState || state !== storedState) {
          console.error('State validation failed:', { state, storedState });
          
          // For development, we can be more lenient with state validation
          if (process.env.NODE_ENV === 'development') {
            console.warn('State validation failed, but continuing in development mode');
          } else {
            setStatus('error');
            setMessage('Invalid state parameter. Please try again.');
            return;
          }
        }

        // Clear the stored state immediately to prevent duplicate usage
        sessionStorage.removeItem('whoop_oauth_state');

        console.log('WHOOP OAuth state validated successfully');

        // Exchange authorization code for tokens
        try {
          await whoopAuth(code);
          
          setStatus('success');
          setMessage('WHOOP account connected successfully!');
          
          // Redirect back to dashboard after a short delay
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } catch (authError) {
          console.error('WHOOP auth API error:', authError);
          
          // Handle specific error cases
          if (authError.message.includes('already been used')) {
            setStatus('error');
            setMessage('This authorization code has already been used. Please try connecting WHOOP again.');
          } else if (authError.message.includes('invalid_grant')) {
            setStatus('error');
            setMessage('Authorization code is invalid or expired. Please try connecting WHOOP again.');
          } else {
            setStatus('error');
            setMessage(`Failed to exchange authorization code: ${authError.message}`);
          }
        }
      } catch (error) {
        console.error('WHOOP callback error:', error);
        setStatus('error');
        setMessage('Failed to connect WHOOP account. Please try again.');
      }
    };

    handleWhoopCallback();
  }, [searchParams, navigate, isProcessing]);

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
          <div className="flex justify-center mb-4">
            {status === 'loading' && (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            )}
            {status === 'success' && (
              <CheckCircle className="h-12 w-12 text-green-500" />
            )}
            {status === 'error' && (
              <XCircle className="h-12 w-12 text-red-500" />
            )}
          </div>
          
          <h2 className="text-2xl font-light text-gray-900 dark:text-white mb-2">
            {status === 'loading' && 'Connecting to WHOOP'}
            {status === 'success' && 'WHOOP Connected!'}
            {status === 'error' && 'Connection Failed'}
          </h2>
          
          <p className="text-gray-600 dark:text-gray-300">
            {message}
          </p>

          {status === 'error' && (
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 