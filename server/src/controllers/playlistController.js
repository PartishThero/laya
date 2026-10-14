import Playlist from '../models/Playlist.js';
import Song from '../models/Song.js';

// GET /api/playlists - list public playlists
export const getPlaylists = async (req, res, next) => {
  try {
    const playlists = await Playlist.find({ isPublic: true })
      .populate('owner', 'displayName username avatarUrl')
      .populate('songs', 'title duration')
      .sort({ createdAt: -1 });
    res.json(playlists);
  } catch (err) {
    next(err);
  }
};

// GET /api/playlists/:playlistId
export const getPlaylistById = async (req, res, next) => {
  try {
    const playlist = await Playlist.findById(req.params.playlistId)
      .populate('owner', 'displayName username avatarUrl')
      .populate({
        path: 'songs',
        populate: [
          { path: 'artist', select: 'name' },
          { path: 'album', select: 'title coverUrl' }
        ]
      });

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Access check: allow if public or if current user is owner
    const currentUserId = req.user ? (req.user._id || req.user.id).toString() : null;
    if (!playlist.isPublic && (!currentUserId || playlist.owner._id.toString() !== currentUserId)) {
      return res.status(403).json({ message: 'Access denied to private playlist' });
    }

    res.json(playlist);
  } catch (err) {
    next(err);
  }
};

// POST /api/playlists - create playlist
export const createPlaylist = async (req, res, next) => {
  try {
    const { name, description, isPublic } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Playlist name is required' });
    }

    const playlist = await Playlist.create({
      name: name.trim(),
      description,
      isPublic: Boolean(isPublic),
      owner: req.user._id || req.user.id,
      songs: []
    });

    res.status(201).json(playlist);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/playlists/:playlistId - rename/update playlist
export const updatePlaylist = async (req, res, next) => {
  try {
    const playlist = await Playlist.findById(req.params.playlistId);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    const userId = (req.user._id || req.user.id).toString();
    if (playlist.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to modify this playlist' });
    }

    const { name, description, isPublic, coverUrl } = req.body;
    if (name !== undefined) playlist.name = name.trim();
    if (description !== undefined) playlist.description = description;
    if (isPublic !== undefined) playlist.isPublic = Boolean(isPublic);
    if (coverUrl !== undefined) playlist.coverUrl = coverUrl;

    await playlist.save();
    res.json(playlist);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/playlists/:playlistId - delete playlist
export const deletePlaylist = async (req, res, next) => {
  try {
    const playlist = await Playlist.findById(req.params.playlistId);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    const userId = (req.user._id || req.user.id).toString();
    if (playlist.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this playlist' });
    }

    await Playlist.findByIdAndDelete(playlist._id);
    res.json({ message: 'Playlist deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// POST /api/playlists/:playlistId/songs - add song
export const addSongToPlaylist = async (req, res, next) => {
  try {
    const { songId } = req.body;
    if (!songId) {
      return res.status(400).json({ message: 'songId is required' });
    }

    const playlist = await Playlist.findById(req.params.playlistId);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    const userId = (req.user._id || req.user.id).toString();
    if (playlist.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to modify this playlist' });
    }

    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    if (!playlist.songs.includes(song._id)) {
      playlist.songs.push(song._id);
      await playlist.save();
    }

    res.json(playlist);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/playlists/:playlistId/songs/:songId - remove song
export const removeSongFromPlaylist = async (req, res, next) => {
  try {
    const { playlistId, songId } = req.params;
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    const userId = (req.user._id || req.user.id).toString();
    if (playlist.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to modify this playlist' });
    }

    playlist.songs = playlist.songs.filter(id => id.toString() !== songId);
    await playlist.save();

    res.json(playlist);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/playlists/:playlistId/reorder - reorder songs
export const reorderPlaylistSongs = async (req, res, next) => {
  try {
    const { songs } = req.body;
    if (!Array.isArray(songs)) {
      return res.status(400).json({ message: 'songs must be an array of song IDs' });
    }

    const playlist = await Playlist.findById(req.params.playlistId);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    const userId = (req.user._id || req.user.id).toString();
    if (playlist.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to modify this playlist' });
    }

    playlist.songs = songs;
    await playlist.save();

    res.json(playlist);
  } catch (err) {
    next(err);
  }
};
