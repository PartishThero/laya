import express from 'express';
import {
  getMyPlaylists,
  likeSong,
  unlikeSong,
  getLikedSongs,
  recordHistory,
  getHistory
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me/playlists', protect, getMyPlaylists);
router.put('/me/likes/:songId', protect, likeSong);
router.delete('/me/likes/:songId', protect, unlikeSong);
router.get('/me/likes', protect, getLikedSongs);
router.post('/me/history', protect, recordHistory);
router.get('/me/history', protect, getHistory);

export default router;
