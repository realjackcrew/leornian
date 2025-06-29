import axios from 'axios';
import { API_BASE_URL } from '../config';

export const register = (email, password, firstName, lastName) =>
  axios.post(`${API_BASE_URL}/api/register`, { email, password, firstName, lastName });

export const login = (email, password) =>
  axios.post(`${API_BASE_URL}/api/login`, { email, password });

export const googleAuth = (idToken) =>
  axios.post(`${API_BASE_URL}/api/google-auth`, { idToken });

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