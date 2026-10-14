// services/api/history.api.js
import { api } from './client.js';

export const historyApi = {
  getHistory: async () => {
    return await api.get('/users/me/history');
  },

  recordHistory: async (songId) => {
    try {
      const cleanId = String(songId).replace(/^(song|album|playlist):/, '');
      return await api.post('/users/me/history', { songId: cleanId });
    } catch {
      return null;
    }
  }
};
