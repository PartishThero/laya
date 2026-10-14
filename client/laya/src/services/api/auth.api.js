// services/api/auth.api.js
import { api } from './client.js';

export const authApi = {
  login: async (identifier, password) => {
    const payload = identifier.includes('@')
      ? { email: identifier, password }
      : { username: identifier, password };
    const res = await api.post('/auth/login', payload);
    if (res?.token) {
      localStorage.setItem('laya_token', res.token);
    }
    return res;
  },

  register: async ({ username, email, password, displayName }) => {
    const res = await api.post('/auth/register', { username, email, password, displayName });
    if (res?.token) {
      localStorage.setItem('laya_token', res.token);
    }
    return res;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout', {});
    } catch {
      // Ignore network errors on logout
    }
    localStorage.removeItem('laya_token');
    return { ok: true };
  },

  getMe: async () => {
    return await api.get('/auth/me');
  }
};
