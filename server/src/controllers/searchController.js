import Song from '../models/Song.js';
import Artist from '../models/Artist.js';
import Album from '../models/Album.js';

// GET /api/search?q=...
export const searchAll = async (req, res, next) => {
  try {
    const query = req.query.q || req.query.search || '';
    if (!query.trim()) {
      return res.json({
        query: '',
        songs: [],
        artists: [],
        albums: []
      });
    }

    const regex = { $regex: query.trim(), $options: 'i' };

    const [songs, artists, albums] = await Promise.all([
      Song.find({ title: regex, isPublished: true })
        .populate('artist', 'name imageUrl')
        .populate('album', 'title coverUrl')
        .limit(20),
      Artist.find({ name: regex }).limit(10),
      Album.find({ title: regex }).populate('artist', 'name').limit(10)
    ]);

    res.json({
      query: query.trim(),
      songs,
      artists,
      albums
    });
  } catch (err) {
    next(err);
  }
};

import Playlist from '../models/Playlist.js';

// GET /api/discover - curated and data-driven discovery results for the 2D canvas
export const getDiscovery = async (req, res, next) => {
  try {
    const { kinds, page = 1, limit = 12 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const kindList = kinds ? kinds.split(',').map(k => k.trim().toLowerCase()) : ['song', 'album'];

    let songs = [];
    let albums = [];
    let playlists = [];

    const promises = [];

    if (kindList.includes('song')) {
      promises.push(
        Song.find({ isPublished: true })
          .populate('artist', 'name imageUrl')
          .populate('album', 'title coverUrl')
          .skip(skip)
          .limit(limitNum)
          .sort({ createdAt: -1 })
          .then(res => { songs = res; })
      );
    }

    if (kindList.includes('album')) {
      promises.push(
        Album.find()
          .populate('artist', 'name')
          .skip(skip)
          .limit(limitNum)
          .sort({ createdAt: -1 })
          .then(res => { albums = res; })
      );
    }

    if (kindList.includes('playlist')) {
      promises.push(
        Playlist.find({ isPublic: true })
          .populate('owner', 'displayName username')
          .populate('songs', 'title duration')
          .skip(skip)
          .limit(limitNum)
          .sort({ createdAt: -1 })
          .then(res => { playlists = res; })
      );
    }

    await Promise.all(promises);

    res.json({
      page: pageNum,
      limit: limitNum,
      kinds: kindList,
      songs,
      albums,
      playlists,
      featuredSongs: songs.slice(0, 8),
      featuredAlbums: albums.slice(0, 6)
    });
  } catch (err) {
    next(err);
  }
};
