// middleware/uploadMiddleware.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import os from 'os';

// On Vercel / serverless, use the writable /tmp directory to avoid EROFS crashes
const uploadBase = process.env.VERCEL
  ? path.join(os.tmpdir(), 'uploads')
  : path.resolve(process.cwd(), 'uploads');

const audioDir = path.join(uploadBase, 'audio');
const coversDir = path.join(uploadBase, 'covers');

try {
  if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });
  if (!fs.existsSync(coversDir)) fs.mkdirSync(coversDir, { recursive: true });
} catch (err) {
  console.warn('Could not initialize upload directories:', err.message);
}

// Use memoryStorage for serverless environments so audio buffers can be written
// directly to MongoDB GridFS and cover images can be encoded as Base64 data URIs
const storage = multer.memoryStorage();

export const uploadSongMedia = multer({
  storage,
  limits: {
    fileSize: 80 * 1024 * 1024 // 80 MB limit for audio
  }
});
