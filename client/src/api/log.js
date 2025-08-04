import { API_BASE_URL } from '../config';

export const getLogs = async (token) => {
  const response = await fetch(`${API_BASE_URL}/api/log`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

export const getLogByDate = async (token, date) => {
  const url = `${API_BASE_URL}/api/log/by-date?date=${date}`;
  console.log('Calling getLogByDate with URL:', url);
  
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

export const createLog = async (token, data) => {
  const response = await fetch(`${API_BASE_URL}/api/log`, {
    method: 'POST',
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

export const updateLog = async (token, logId, data) => {
  const response = await fetch(`${API_BASE_URL}/api/log/update?id=${logId}`, {
    method: 'PUT',
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};