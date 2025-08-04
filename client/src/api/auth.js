import { API_BASE_URL } from '../config';
export const register = async (email, password, firstName, lastName, verificationToken) => {
  const response = await fetch(`${API_BASE_URL}/api/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, firstName, lastName, verificationToken }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};
export const login = async (email, password, rememberMe = false) => {
  const response = await fetch(`${API_BASE_URL}/api/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, rememberMe }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};
export const googleAuth = async (idToken, rememberMe = false) => {
  const response = await fetch(`${API_BASE_URL}/api/google-auth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ idToken, rememberMe }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};
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
export const requestPasswordReset = async (email) => {
  const response = await fetch(`${API_BASE_URL}/api/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};
export const verifyResetCode = async (email, code) => {
  const response = await fetch(`${API_BASE_URL}/api/verify-reset-code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, code }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};
export const resetPassword = async (email, newPassword, verificationToken) => {
  const response = await fetch(`${API_BASE_URL}/api/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, newPassword, verificationToken }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};
export const sendVerificationCode = async (email, purpose) => {
  const response = await fetch(`${API_BASE_URL}/api/send-verification-code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, purpose }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};
export const verifyEmailCode = async (email, code, purpose) => {
  const response = await fetch(`${API_BASE_URL}/api/verify-code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, code, purpose }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};
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
export const fetchWhoopData = async (date) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('User not authenticated. Please log in first.');
  const url = new URL(`${API_BASE_URL}/api/whoop/data`);
  if (date) {
    url.searchParams.append('date', date);
  }
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    let errorMessage = 'Failed to fetch WHOOP data';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch (parseError) {
      try {
        const errorText = await response.text();
        errorMessage = errorText || errorMessage;
      } catch (textError) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
    }
    throw new Error(errorMessage);
  }
  return response.json();
};