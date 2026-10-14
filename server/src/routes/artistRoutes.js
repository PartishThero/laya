import express from 'express';
import { getArtists, getArtistById } from '../controllers/artistController.js';

const router = express.Router();

router.get('/', getArtists);
router.get('/:artistId', getArtistById);

export default router;
