import axios from 'axios';

interface LoginResponse {
  session: {
    token: string;
  };
  user: {
    id: string;
    username: string;
    email: string;
  };
}

const API = axios.create({
  baseURL: 'http://127.0.0.1:3000',
  withCredentials: true,
});

export const registerUser = (data: { username: string; email: string; password: string }) =>
  API.post('/auth/register', data);

export const loginUser = (data: { email: string; password: string }) =>
  API.post<LoginResponse>('/auth/login', data);