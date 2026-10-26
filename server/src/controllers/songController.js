import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Song from '../models/Song.js';
import Artist from '../models/Artist.js';
import Album from '../models/Album.js';
import fs from 'fs';
import path from 'path';

// GET /api/songs - list with optional pagination, search, genre filter
export const getSongs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search = '', genre, artist, album } = req.query;
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

// POST /api/songs - Create or upload song
export const createSong = async (req, res, next) => {
  try {
    const {
      title,
      artistName,
      albumTitle,
      genre,
      duration,
      audioUrl: directAudioUrl,
      coverUrl: directCoverUrl
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Song title is required' });
    }

    // Determine audio URL
    let finalAudioUrl = directAudioUrl?.trim();
    if (req.files && req.files.audioFile && req.files.audioFile[0]) {
      const audioFile = req.files.audioFile[0];
      const mongooseInstance = await connectDB();
      const db = mongooseInstance.connection ? mongooseInstance.connection.db : mongooseInstance.db;
      const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'audio' });

      const uploadStream = bucket.openUploadStream(audioFile.originalname, {
        contentType: audioFile.mimetype || 'audio/mpeg'
      });

      await new Promise((resolve, reject) => {
        uploadStream.end(audioFile.buffer);
        uploadStream.on('finish', resolve);
        uploadStream.on('error', reject);
      });

      finalAudioUrl = `/api/songs/audio/${uploadStream.id}`;
    }

    if (!finalAudioUrl) {
      return res.status(400).json({ message: 'Audio file or audio URL is required' });
    }

    // Determine cover URL
    let finalCoverUrl = directCoverUrl?.trim();
    if (req.files && req.files.coverFile && req.files.coverFile[0]) {
      const coverFile = req.files.coverFile[0];
      const mime = coverFile.mimetype || 'image/jpeg';
      finalCoverUrl = `data:${mime};base64,${coverFile.buffer.toString('base64')}`;
    }
    if (!finalCoverUrl) {
      finalCoverUrl = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&auto=format&fit=crop&q=80';
    }

    // Resolve or create Artist
    const cleanArtistName = (artistName || 'Unknown Artist').trim();
    let artist = await Artist.findOne({ name: { $regex: new RegExp(`^${cleanArtistName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } });
    if (!artist) {
      artist = await Artist.create({
        name: cleanArtistName,
        bio: `${cleanArtistName} catalogue artist on Laya.`,
        imageUrl: finalCoverUrl,
        genres: genre ? [genre] : ['Vinyl']
      });
    }

    // Resolve or create Album if provided
    let albumId = null;
    if (albumTitle && albumTitle.trim()) {
      const cleanAlbumTitle = albumTitle.trim();
      let album = await Album.findOne({
        title: { $regex: new RegExp(`^${cleanAlbumTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
        artist: artist._id
      });
      if (!album) {
        album = await Album.create({
          title: cleanAlbumTitle,
          artist: artist._id,
          coverUrl: finalCoverUrl,
          releaseDate: new Date()
        });
      }
      albumId = album._id;
    }

    const parsedDuration = parseInt(duration, 10);
    const finalDuration = (!isNaN(parsedDuration) && parsedDuration > 0) ? parsedDuration : 180;

    const newSong = await Song.create({
      title: title.trim(),
      artist: artist._id,
      album: albumId,
      audioUrl: finalAudioUrl,
      coverUrl: finalCoverUrl,
      duration: finalDuration,
      genre: genre?.trim() || 'Vinyl',
      releaseDate: new Date(),
      licence: 'User Library',
      attribution: `${cleanArtistName} - ${title.trim()}`,
      isPublished: true
    });

    const populatedSong = await Song.findById(newSong._id)
      .populate('artist', 'name imageUrl')
      .populate('album', 'title coverUrl');

    res.status(201).json(populatedSong);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/songs/:id - delete a song
export const deleteSong = async (req, res, next) => {
  try {
    const song = await Song.findByIdAndDelete(req.params.id);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }
    res.json({ message: 'Song deleted successfully', songId: req.params.id });
  } catch (err) {
    next(err);
  }
};

// GET /api/songs/audio/:fileId - stream audio directly from MongoDB GridFS with HTTP Range support
export const streamAudioById = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    if (!fileId || !mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({ message: 'Invalid audio file ID' });
    }

    const mongooseInstance = await connectDB();
    const db = mongooseInstance.connection ? mongooseInstance.connection.db : mongooseInstance.db;
    const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'audio' });

    const objId = new mongoose.Types.ObjectId(fileId);
    const files = await bucket.find({ _id: objId }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ message: 'Audio file not found in database' });
    }

    const file = files[0];
    const fileSize = file.length;
    const range = req.headers.range;
    const contentType = file.contentType || 'audio/mpeg';

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize) {
        res.status(416).set('Content-Range', `bytes */${fileSize}`);
        return res.end();
      }

      const chunkSize = end - start + 1;
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType
      });

      bucket.openDownloadStream(objId, { start, end: end + 1 }).pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Accept-Ranges': 'bytes',
        'Content-Type': contentType
      });
      bucket.openDownloadStream(objId).pipe(res);
    }
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

    let audioPath = song.audioUrl;
    if (audioPath.startsWith('/api/songs/audio/')) {
      req.params.fileId = audioPath.replace('/api/songs/audio/', '');
      return streamAudioById(req, res, next);
    }

    if (audioPath.startsWith('http://') || audioPath.startsWith('https://')) {
      return res.redirect(audioPath);
    }

    if (audioPath.startsWith('/uploads') || audioPath.startsWith('uploads')) {
      audioPath = path.resolve(process.cwd(), audioPath.replace(/^\//, ''));
    } else if (!path.isAbsolute(audioPath)) {
      audioPath = path.resolve(process.cwd(), audioPath);
    }

    if (!fs.existsSync(audioPath)) {
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
