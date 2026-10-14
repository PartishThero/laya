// services/api/search.api.js
import { api } from './client.js';

export const searchApi = {
  searchAll: async (query) => {
    return await api.get(`/search?q=${encodeURIComponent(query)}`);
  }
};
