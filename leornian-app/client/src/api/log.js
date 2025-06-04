import axios from 'axios';
import { API_BASE_URL } from '../config';

export const getLogs = (token) =>
  axios.get(`${API_BASE_URL}/api/log`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const createLog = (token, data) =>
  axios.post(`${API_BASE_URL}/api/log`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });