import express from 'express';
import {
  getSongs,
  getSong,
  createSong,
  deleteSong,
  streamSong
} from '../controllers/songController.js';
import { uploadSongMedia } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', getSongs);
router.get('/:id', getSong);
router.get('/:id/stream', streamSong);
router.post(
  '/',
  uploadSongMedia.fields([
    { name: 'audioFile', maxCount: 1 },
    { name: 'coverFile', maxCount: 1 }
  ]),
  createSong
);
router.delete('/:id', deleteSong);

export default router;
