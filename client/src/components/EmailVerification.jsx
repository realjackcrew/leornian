import { useState } from 'react';
import { sendVerificationCode, verifyEmailCode } from '../api/auth';
import { getErrorMessage, createRetryFunction } from '../utils/errorUtils';
export default function EmailVerification({ email, purpose, onVerified, disabled }) {
  const [step, setStep] = useState('idle'); 
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const handleSendCode = async () => {
    setIsLoading(true);
    setError('');
    setInfo('');
    try {
      const sendCodeWithRetry = createRetryFunction(sendVerificationCode, 2000);
      await sendCodeWithRetry(email, purpose);
      setStep('sent');
      setInfo('Verification code sent! Check your email.');
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to send code.');
      setError(msg);
      console.error('Send code error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  const handleVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setInfo('');
    try {
      const verifyCodeWithRetry = createRetryFunction(verifyEmailCode, 2000);
      const res = await verifyCodeWithRetry(email, code, purpose);
      setStep('verified');
      setInfo('Email verified!');
      onVerified(res.verificationToken);
    } catch (err) {
      const msg = getErrorMessage(err, 'Invalid or expired code.');
      setError(msg);
      console.error('Verify code error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="space-y-2">
      {step !== 'verified' && (
        <button
          type="button"
          className={`w-full py-2 px-4 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed`}
          onClick={handleSendCode}
          disabled={isLoading || !email || disabled}
        >
          {isLoading ? 'Sending...' : 'Send Verification Code'}
        </button>
      )}
      {step === 'sent' && (
        <form onSubmit={handleVerify} className="flex flex-col gap-2">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            className="w-full px-3 py-2 border rounded"
            placeholder="Enter 6-digit code"
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
            required
            disabled={isLoading}
          />
          <button
            type="submit"
            className="w-full py-2 px-4 rounded bg-green-600 text-white font-semibold hover:bg-green-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={isLoading || code.length !== 6}
          >
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>
      )}
      {info && <div className="text-green-600 text-sm">{info}</div>}
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {step === 'verified' && <div className="text-green-700 font-semibold">Email verified!</div>}
    </div>
  );
} 