import axios from 'axios';
import { API_BASE_URL } from '../config';

export const getLogs = (token) =>
  axios.get(`${API_BASE_URL}/api/log`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getLogByDate = (token, date) => {
  const url = `${API_BASE_URL}/api/log/date/${date}`;
  console.log('Calling getLogByDate with URL:', url);
  return axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const createLog = (token, data) =>
  axios.post(`${API_BASE_URL}/api/log`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateLog = (token, logId, data) =>
  axios.put(`${API_BASE_URL}/api/log/${logId}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });