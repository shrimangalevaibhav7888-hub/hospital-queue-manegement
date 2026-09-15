import { apiRequest } from './client';
import { User } from '../types';

export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<{ user: User; accessToken: string; refreshToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (payload: any) =>
    apiRequest<{ user: User; accessToken: string; refreshToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMe: () =>
    apiRequest<{ user: User; patient?: any; doctor?: any }>('/auth/me'),
};
