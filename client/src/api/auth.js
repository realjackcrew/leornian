import axios from 'axios';
import { API_BASE_URL } from '../config';

export const register = (email, password, firstName, lastName, verificationToken) =>
  axios.post(`${API_BASE_URL}/api/register`, { email, password, firstName, lastName, verificationToken });

export const login = (email, password, rememberMe = false) =>
  axios.post(`${API_BASE_URL}/api/login`, { email, password, rememberMe });

export const googleAuth = (idToken, rememberMe = false) =>
  axios.post(`${API_BASE_URL}/api/google-auth`, { idToken, rememberMe });

export const whoopAuth = async (authorizationCode) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('User not authenticated. Please log in first.');
  }

  const response = await fetch(`${API_BASE_URL}/api/whoop/auth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ authorizationCode })
  });

  if (!response.ok) {
    let errorMessage = 'WHOOP authentication failed';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch (parseError) {
      // If response is not JSON, try to get text
      try {
        const errorText = await response.text();
        errorMessage = errorText || errorMessage;
      } catch (textError) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
    }
    throw new Error(errorMessage);
  }

  try {
    return await response.json();
  } catch (parseError) {
    console.error('Failed to parse WHOOP auth response:', parseError);
    throw new Error('Invalid response from server');
  }
};

export const checkWhoopStatus = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/api/whoop/status`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to check WHOOP status');
  }

  return response.json();
};

export const disconnectWhoop = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/api/whoop/disconnect`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to disconnect WHOOP');
  }

  return response.json();
};

// Password reset functions
export const requestPasswordReset = (email) =>
  axios.post(`${API_BASE_URL}/api/forgot-password`, { email });

export const verifyResetCode = (email, code) =>
  axios.post(`${API_BASE_URL}/api/verify-reset-code`, { email, code });

export const resetPassword = (email, newPassword, verificationToken) =>
  axios.post(`${API_BASE_URL}/api/reset-password`, { email, newPassword, verificationToken });

export const sendVerificationCode = (email, purpose) =>
  axios.post(`${API_BASE_URL}/api/send-verification-code`, { email, purpose });

export const verifyEmailCode = (email, code, purpose) =>
  axios.post(`${API_BASE_URL}/api/verify-code`, { email, code, purpose });

export const getUserProfile = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get user profile');
  }

  return response.json();
};