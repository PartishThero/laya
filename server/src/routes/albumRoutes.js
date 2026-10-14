import express from 'express';
import { getAlbums, getAlbumById } from '../controllers/albumController.js';

const router = express.Router();

router.get('/', getAlbums);
router.get('/:albumId', getAlbumById);

export default router;
