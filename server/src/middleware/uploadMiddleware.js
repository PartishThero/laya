// middleware/uploadMiddleware.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const audioDir = path.resolve(process.cwd(), 'uploads/audio');
const coversDir = path.resolve(process.cwd(), 'uploads/covers');

if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });
if (!fs.existsSync(coversDir)) fs.mkdirSync(coversDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'coverFile') {
      cb(null, coversDir);
    } else {
      cb(null, audioDir);
    }
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
