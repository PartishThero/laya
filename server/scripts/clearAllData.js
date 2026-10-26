// scripts/clearAllData.js
// Completely purges all songs, albums, artists, playlists, and listening history from MongoDB
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Song from '../src/models/Song.js';
import Album from '../src/models/Album.js';
import Artist from '../src/models/Artist.js';
import Playlist from '../src/models/Playlist.js';
import ListeningEvent from '../src/models/ListeningEvent.js';
import User from '../src/models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const mongoUri = process.env.MONGODB_URI || process.env.DBuri;

if (!mongoUri) {
  console.error('❌ MONGODB_URI not found in .env');
  process.exit(1);
}

import fs from 'fs';

const clearAll = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB. Clearing all music and catalogue data...');

    const songCount = await Song.countDocuments();
    const albumCount = await Album.countDocuments();
    const artistCount = await Artist.countDocuments();
    const playlistCount = await Playlist.countDocuments();
    const eventCount = await ListeningEvent.countDocuments();

    await Song.deleteMany({});
    await Album.deleteMany({});
    await Artist.deleteMany({});
    await Playlist.deleteMany({});
    await ListeningEvent.deleteMany({});
    await User.updateMany({}, { likedSongs: [], followedArtists: [] });

    console.log(`🧹 Deleted ${songCount} songs`);
    console.log(`🧹 Deleted ${albumCount} albums`);
    console.log(`🧹 Deleted ${artistCount} artists`);
    console.log(`🧹 Deleted ${playlistCount} playlists`);
    console.log(`🧹 Deleted ${eventCount} listening events`);

    // Drop GridFS audio files & chunks
    try {
      const db = mongoose.connection.db;
      await db.collection('audio.files').drop().catch(() => {});
      await db.collection('audio.chunks').drop().catch(() => {});
      console.log('🧹 Purged GridFS audio collections');
    } catch (_) {}

    // Clean uploads directory
    const uploadsDir = path.resolve(__dirname, '../uploads');
    const audioDir = path.join(uploadsDir, 'audio');
    const coversDir = path.join(uploadsDir, 'covers');

    [audioDir, coversDir].forEach(dir => {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          if (file.startsWith('.')) continue;
          fs.unlinkSync(path.join(dir, file));
          console.log(`🧹 Removed uploaded file: ${file}`);
        }
      }
    });

    console.log('✨ All data and uploaded files have been completely removed!');

    process.exit(0);
  } catch (err) {
    console.error('❌ Clear failed:', err);
    process.exit(1);
  }
};

clearAll();
