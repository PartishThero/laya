import express from 'express';
import { getSongs, getSong, streamSong } from '../controllers/songController.js';

const router = express.Router();

router.get('/', getSongs);
router.get('/:id', getSong);
router.get('/:id/stream', streamSong);

export default router;
