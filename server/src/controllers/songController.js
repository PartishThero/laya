import Song from '../models/Song.js';
import fs from 'fs';
import path from 'path';

// GET /api/songs - list with optional pagination, search, genre filter
export const getSongs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '', genre, artist, album } = req.query;
    const query = { isPublished: true };

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    if (genre) {
      query.genre = genre;
    }
    if (artist) {
      query.artist = artist;
    }
    if (album) {
      query.album = album;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));

    const [songs, total] = await Promise.all([
      Song.find(query)
        .populate('artist', 'name imageUrl')
        .populate('album', 'title coverUrl')
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .sort({ createdAt: -1 }),
      Song.countDocuments(query)
    ]);

    res.json({
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      limit: limitNum,
      songs
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/songs/:id - song metadata
export const getSong = async (req, res, next) => {
  try {
    const song = await Song.findById(req.params.id)
      .populate('artist', 'name bio imageUrl genres')
      .populate('album', 'title coverUrl releaseDate');

    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }
    res.json(song);
  } catch (err) {
    next(err);
  }
};

// GET /api/songs/:id/stream - stream audio file with range support
export const streamSong = async (req, res, next) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    // Resolve audio path safely
    let audioPath = song.audioUrl;
    if (!path.isAbsolute(audioPath)) {
      audioPath = path.resolve(process.cwd(), audioPath);
    }

    if (!fs.existsSync(audioPath)) {
      // If local file does not exist, return 404 or redirect if it's an external URL
      if (song.audioUrl.startsWith('http://') || song.audioUrl.startsWith('https://')) {
        return res.redirect(song.audioUrl);
      }
      return res.status(404).json({ message: 'Audio file not found on server' });
    }

    const stat = fs.statSync(audioPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize) {
        res.status(416).set('Content-Range', `bytes */${fileSize}`);
        return res.end();
      }

      const chunkSize = end - start + 1;
      const fileStream = fs.createReadStream(audioPath, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'audio/mpeg'
      });

      fileStream.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Accept-Ranges': 'bytes',
        'Content-Type': 'audio/mpeg'
      });
      fs.createReadStream(audioPath).pipe(res);
    }
  } catch (err) {
    next(err);
  }
};
