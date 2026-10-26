import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import songRoutes from './routes/songRoutes.js';
import artistRoutes from './routes/artistRoutes.js';
import albumRoutes from './routes/albumRoutes.js';
import playlistRoutes from './routes/playlistRoutes.js';
import userRoutes from './routes/userRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import { getDiscovery } from './controllers/searchController.js';
import path from 'path';
import errorMiddleware from './middleware/errorMiddleware.js';

dotenv.config();
connectDB();

const app = express();

const clientOrigin = process.env.CLIENT_ORIGIN;
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin header (same-origin, mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    if (
      !clientOrigin ||
      origin === clientOrigin ||
      origin === 'http://localhost:5173' ||
      origin === 'http://127.0.0.1:5173' ||
      origin === 'http://localhost:3000' ||
      origin.endsWith('.vercel.app') ||
      process.env.NODE_ENV !== 'production'
    ) {
      return callback(null, true);
    }

    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static file hosting for user-uploaded audio and cover artwork
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

// Only log failed requests (>= 400) to keep server console clean, unless DEBUG_HTTP=true
app.use(morgan('dev', {
  skip: (req, res) => !process.env.DEBUG_HTTP && res.statusCode < 400
}));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// Primary REST routes
app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/users', userRoutes);
app.use('/api/search', searchRoutes);
app.get('/api/discover', getDiscovery);

// 404 central handler
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Central error handler
app.use(errorMiddleware);

export default app;
