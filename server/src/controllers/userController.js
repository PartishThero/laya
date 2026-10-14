import User from '../models/User.js';
import Song from '../models/Song.js';
import Playlist from '../models/Playlist.js';
import ListeningEvent from '../models/ListeningEvent.js';

// GET /api/users/me/playlists
export const getMyPlaylists = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const playlists = await Playlist.find({ owner: userId })
      .populate('songs', 'title duration coverUrl')
      .sort({ updatedAt: -1 });

    res.json(playlists);
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/me/likes/:songId - idempotent like
export const likeSong = async (req, res, next) => {
  try {
    const { songId } = req.params;
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId);

    if (!user.likedSongs.includes(song._id)) {
      user.likedSongs.push(song._id);
      await user.save();
    }

    res.json({ message: 'Song liked', liked: true, songId: song._id });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/me/likes/:songId - unlike
export const unlikeSong = async (req, res, next) => {
  try {
    const { songId } = req.params;
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId);

    user.likedSongs = user.likedSongs.filter(id => id.toString() !== songId);
    await user.save();

    res.json({ message: 'Song unliked', liked: false, songId });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/me/likes - list liked songs
export const getLikedSongs = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId).populate({
      path: 'likedSongs',
      populate: [
        { path: 'artist', select: 'name imageUrl' },
        { path: 'album', select: 'title coverUrl' }
      ]
    });

    res.json(user.likedSongs || []);
  } catch (err) {
    next(err);
  }
};

// POST /api/users/me/history - record listening event
export const recordHistory = async (req, res, next) => {
  try {
    const { songId, positionSeconds, completed } = req.body;
    if (!songId) {
      return res.status(400).json({ message: 'songId is required' });
    }

    const cleanId = String(songId).replace(/^(song|album|playlist):/, '');
    const song = await Song.findById(cleanId);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    const userId = req.user._id || req.user.id;

    const event = await ListeningEvent.create({
      user: userId,
      song: song._id,
      positionSeconds: positionSeconds || 0,
      completed: Boolean(completed),
      playedAt: new Date()
    });

    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
};

// GET /api/users/me/history - get recent listening history
export const getHistory = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { limit = 20 } = req.query;

    const history = await ListeningEvent.find({ user: userId })
      .sort({ playedAt: -1 })
      .limit(Math.min(50, parseInt(limit, 10)))
      .populate({
        path: 'song',
        populate: [
          { path: 'artist', select: 'name imageUrl' },
          { path: 'album', select: 'title coverUrl' }
        ]
      });

    res.json(history);
  } catch (err) {
    next(err);
  }
};
