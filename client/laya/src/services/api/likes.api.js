// services/api/likes.api.js
import { api } from './client.js';

export const likesApi = {
  getLikes: async () => {
    return await api.get('/users/me/likes');
  },

  likeSong: async (songId) => {
    return await api.put(`/users/me/likes/${songId}`, {});
  },

  unlikeSong: async (songId) => {
    return await api.delete(`/users/me/likes/${songId}`);
  }
};
