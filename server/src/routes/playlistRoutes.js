import express from 'express';
import {
  getPlaylists,
  getPlaylistById,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  reorderPlaylistSongs
} from '../controllers/playlistController.js';
import { protect } from '../middleware/authMiddleware.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Middleware to optionally attach user for public/private playlist access
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  let token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : req.cookies?.token;
  if (token) {
    try {
      const JWT_SECRET = process.env.AUTH_SECRET || process.env.jwt_secret || 'supersecret';
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-passwordHash');
    } catch {
      // Ignore token failure for public access check
    }
  }
  next();
};

router.get('/', optionalAuth, getPlaylists);
router.get('/:playlistId', optionalAuth, getPlaylistById);
router.post('/', protect, createPlaylist);
router.patch('/:playlistId', protect, updatePlaylist);
router.delete('/:playlistId', protect, deletePlaylist);
router.post('/:playlistId/songs', protect, addSongToPlaylist);
router.delete('/:playlistId/songs/:songId', protect, removeSongFromPlaylist);
router.patch('/:playlistId/reorder', protect, reorderPlaylistSongs);

export default router;
