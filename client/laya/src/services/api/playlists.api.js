// services/api/playlists.api.js
import { api } from './client.js';

export const playlistsApi = {
  getPublicPlaylists: async () => {
    return await api.get('/playlists');
  },

  getMyPlaylists: async () => {
    return await api.get('/users/me/playlists');
  },

  getPlaylist: async (id) => {
    return await api.get(`/playlists/${id}`);
  },

  createPlaylist: async ({ name, description = '', isPublic = true }) => {
    return await api.post('/playlists', { name, description, isPublic });
  },

  updatePlaylist: async (id, data) => {
    return await api.patch(`/playlists/${id}`, data);
  },

  deletePlaylist: async (id) => {
    return await api.delete(`/playlists/${id}`);
  },

  addSong: async (playlistId, songId) => {
    return await api.post(`/playlists/${playlistId}/songs`, { songId });
  },

  removeSong: async (playlistId, songId) => {
    return await api.delete(`/playlists/${playlistId}/songs/${songId}`);
  },

  reorderSongs: async (playlistId, songs) => {
    return await api.patch(`/playlists/${playlistId}/reorder`, { songs });
  }
};
