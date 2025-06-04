import axios from 'axios';

const BASE = 'http://localhost:4000';

export const getLogs = (token) =>
  axios.get(`${BASE}/api/logs`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const createLog = (token, data) =>
  axios.post(`${BASE}/api/log`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });