import axios from 'axios';
import { API_BASE_URL } from '../config';

export const register = (email, password, firstName, lastName) =>
  axios.post(`${API_BASE_URL}/api/register`, { email, password, firstName, lastName });

export const login = (email, password) =>
  axios.post(`${API_BASE_URL}/api/login`, { email, password });

export const googleAuth = (idToken) =>
  axios.post(`${API_BASE_URL}/api/google-auth`, { idToken });