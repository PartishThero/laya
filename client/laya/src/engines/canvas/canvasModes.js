// engines/canvas/canvasModes.js
// Canvas view filter configurations

export const CANVAS_MODES = {
  home: {
    id: 'home',
    name: 'Home',
    kinds: ['song', 'album'],
    greeting: true,
    emptyText: 'No music discovered yet.'
  },
  songs: {
    id: 'songs',
    name: 'Songs',
    kinds: ['song'],
    greeting: false,
    emptyText: 'No songs found in catalogue.'
  },
  playlists: {
    id: 'playlists',
    name: 'Playlists',
    kinds: ['playlist'],
    greeting: false,
    emptyText: 'No playlists created yet.'
  },
  albums: {
    id: 'albums',
    name: 'Albums',
    kinds: ['album'],
    greeting: false,
    emptyText: 'No albums found in catalogue.'
  }
};
