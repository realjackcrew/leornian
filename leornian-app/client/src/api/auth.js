import axios from 'axios';

const BASE = 'http://localhost:4000';

export const register = (email, password) =>
  axios.post(`${BASE}/auth/register`, { email, password });

export const login = (email, password) =>
  axios.post(`${BASE}/auth/login`, { email, password });