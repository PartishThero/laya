// services/spotify.service.js
// Spotify Web API client supporting Client Credentials flow for metadata & catalogue sync

class SpotifyService {
  constructor() {
    this.token = null;
    this.tokenExpiresAt = 0;
  }

  isConfigured() {
    return Boolean(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET);
  }

  async getAccessToken() {
    if (!this.isConfigured()) {
      return null;
    }

    // Return cached token if valid with 60s buffer
    if (this.token && Date.now() < this.tokenExpiresAt - 60000) {
      return this.token;
    }

    try {
      const clientId = process.env.SPOTIFY_CLIENT_ID;
      const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
      const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`Spotify token request failed (${response.status}):`, errorText);
        return null;
      }

      const data = await response.json();
      this.token = data.access_token;
      this.tokenExpiresAt = Date.now() + (data.expires_in * 1000);
      return this.token;
    } catch (err) {
      console.warn('Failed to obtain Spotify access token:', err.message);
      return null;
    }
  }

  async fetchFromApi(endpoint, options = {}) {
    const token = await this.getAccessToken();
    if (!token) return null;

    const url = endpoint.startsWith('http') ? endpoint : `https://api.spotify.com/v1${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      });

      if (!response.ok) {
        console.warn(`Spotify API ${endpoint} failed (${response.status})`);
        return null;
      }

      return await response.json();
    } catch (err) {
      console.warn(`Spotify API error for ${endpoint}:`, err.message);
      return null;
    }
  }

  // Search Spotify tracks, albums, or artists
  async search(query, types = 'track,album,artist', limit = 20) {
    const params = new URLSearchParams({
      q: query,
      type: types,
      limit: String(limit)
    });
    return await this.fetchFromApi(`/search?${params.toString()}`);
  }

  // Fetch playlist details and its tracks
  async getPlaylist(playlistId) {
    return await this.fetchFromApi(`/playlists/${playlistId}`);
  }

  // Fetch album details and tracks
  async getAlbum(albumId) {
    return await this.fetchFromApi(`/albums/${albumId}`);
  }

  // Fetch artist top tracks
  async getArtistTopTracks(artistId, market = 'US') {
    return await this.fetchFromApi(`/artists/${artistId}/top-tracks?market=${market}`);
  }
}

export const spotifyService = new SpotifyService();
