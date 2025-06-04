import axios from 'axios';
import { API_BASE_URL } from '../config';

export const register = (email, password) =>
  axios.post(`${API_BASE_URL}/api/register`, { email, password });

export const login = (email, password) =>
  axios.post(`${API_BASE_URL}/api/login`, { email, password });