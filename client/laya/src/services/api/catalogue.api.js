// services/api/catalogue.api.js
import { api } from './client.js';

export const catalogueApi = {
  getDiscover: async ({ kinds = 'song,album', page = 1, limit = 12, seed = '' } = {}) => {
    const params = new URLSearchParams({ kinds, page, limit });
    if (seed) params.append('seed', seed);
    return await api.get(`/discover?${params.toString()}`);
  },

  getSongs: async ({ page = 1, limit = 50, search = '', genre = '', artist = '', album = '' } = {}) => {
    const params = new URLSearchParams({ page, limit });
    if (search) params.append('search', search);
    if (genre) params.append('genre', genre);
    if (artist) params.append('artist', artist);
    if (album) params.append('album', album);
    return await api.get(`/songs?${params.toString()}`);
  },

  getSong: async (id) => {
    return await api.get(`/songs/${id}`);
  },

  createSong: async (payload) => {
    return await api.post('/songs', payload);
  },

  deleteSong: async (id) => {
    return await api.delete(`/songs/${id}`);
  },

  getAlbums: async ({ page = 1, limit = 20 } = {}) => {
    const params = new URLSearchParams({ page, limit });
    return await api.get(`/albums?${params.toString()}`);
  },

  getAlbum: async (id) => {
    return await api.get(`/albums/${id}`);
  },

  getArtists: async ({ page = 1, limit = 20 } = {}) => {
    const params = new URLSearchParams({ page, limit });
    return await api.get(`/artists?${params.toString()}`);
  },

  getArtist: async (id) => {
    return await api.get(`/artists/${id}`);
  }
};
