import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let cachedPromise = null;

const connectDB = async () => {
  // If already connected, reuse existing connection (warm start in serverless)
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (cachedPromise) {
    return cachedPromise;
  }

  const mongoUri = process.env.MONGODB_URI || process.env.DBuri;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not configured in Vercel Environment Variables. Please add MONGODB_URI in Vercel Project Settings > Environment Variables.');
  }

  const opts = {
    bufferCommands: false,
    serverSelectionTimeoutMS: 5000,
  };

  cachedPromise = mongoose.connect(mongoUri, opts)
    .then((mongooseInstance) => {
      console.log('MongoDB connected successfully');
      return mongooseInstance;
    })
    .catch((err) => {
      cachedPromise = null;
      console.error('MongoDB connection error:', err.message);
      throw err;
    });

  return cachedPromise;
};

export default connectDB;
