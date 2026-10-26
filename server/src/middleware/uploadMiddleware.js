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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const targetDir = file.fieldname === 'coverFile' ? coversDir : audioDir;
    try {
      if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    } catch (_) {}
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '';
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_').slice(0, 30);
    cb(null, `${file.fieldname}-${uniqueSuffix}-${safeName}${ext}`);
  }
});

export const uploadSongMedia = multer({
  storage,
  limits: {
    fileSize: 80 * 1024 * 1024 // 80 MB limit for high-res audio
  }
});
