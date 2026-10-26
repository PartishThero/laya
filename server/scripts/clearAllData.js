// scripts/clearAllData.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI in server/.env');
  process.exit(1);
}

async function clearData() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.');

  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  const collectionNames = collections.map(c => c.name);

  const targets = ['songs', 'albums', 'artists', 'playlists', 'histories', 'audio.files', 'audio.chunks'];

  for (const name of targets) {
    if (collectionNames.includes(name)) {
      await db.collection(name).drop();
      console.log(`Dropped collection: ${name}`);
    }
  }

  console.log('Database cleared successfully.');
  await mongoose.disconnect();
  process.exit(0);
}

clearData().catch((err) => {
  console.error('Error clearing data:', err);
  process.exit(1);
});
