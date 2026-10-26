import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import connectDB from '../src/config/db.js';
import Song from '../src/models/Song.js';
import Artist from '../src/models/Artist.js';
import Album from '../src/models/Album.js';

const SONGS_DIR = '/Users/partish/Downloads/Images/SOngs laya';
const COVERS_DIR = path.join(SONGS_DIR, 'Covers');

const TRACKS_METADATA = [
  {
    fileName: 'Brent Faiyaz - Best Time (Lyrics) [EOyhtqWWXvs].mp3',
    title: 'Best Time',
    artistName: 'Brent Faiyaz',
    artistBio: 'Brent Faiyaz is an American R&B singer and songwriter from Columbia, Maryland.',
    albumTitle: 'Larger Than Life',
    genre: 'R&B',
    duration: 84,
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/94/e6/48/94e648c3-7bc0-5795-97e2-63e9b7cd7cd5/jnbR6NBAORVwD-larger-than-life-original.png/600x600bb.jpg',
    localCoverName: '600x600bb.jpg',
    contentType: 'audio/mpeg'
  },
  {
    fileName: 'Brent Faiyaz - butterflies. [Official Visualizer].mp3',
    title: 'butterflies.',
    artistName: 'Brent Faiyaz',
    artistBio: 'Brent Faiyaz is an American R&B singer and songwriter from Columbia, Maryland.',
    albumTitle: 'butterflies.',
    genre: 'R&B',
    duration: 248,
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/89/83/6e/89836e4d-f67d-cc37-8ca9-b0e7c96f10ff/199976295487.png/600x600bb.jpg',
    localCoverName: '600x600bb (1).jpg',
    contentType: 'audio/mpeg'
  },
  {
    fileName: 'Bryson Tiller - Don t (Lyrics).mp3',
    title: "Don't",
    artistName: 'Bryson Tiller',
    artistBio: 'Bryson Djontrel Tiller is an American singer, songwriter, and rapper from Louisville, Kentucky.',
    albumTitle: 'T R A P S O U L',
    genre: 'R&B',
    duration: 198,
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/26/4a/f9/264af9b7-813d-4b08-2822-de8b26c0e188/886445447811.jpg/600x600bb.jpg',
    localCoverName: '600x600bb (2).jpg',
    contentType: 'audio/mpeg'
  },
  {
    fileName: 'Frank Ocean - Bad Religion.mp3',
    title: 'Bad Religion',
    artistName: 'Frank Ocean',
    artistBio: 'Christopher Francis Ocean is an American singer-songwriter, producer, and visual artist.',
    albumTitle: 'channel ORANGE',
    genre: 'R&B',
    duration: 225,
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/04/f8/63/04f863fc-2852-604f-c910-a97ac069506b/12UMGIM40339.rgb.jpg/600x600bb.jpg',
    localCoverName: '600x600bb (3).jpg',
    contentType: 'audio/mp4'
  },
  {
    fileName: 'Kehlani - Folded (Lyrics).mp3',
    title: 'Folded',
    artistName: 'Kehlani',
    artistBio: 'Kehlani Ashley Parrish is an American singer and songwriter from Oakland, California.',
    albumTitle: 'CRASH',
    genre: 'R&B',
    duration: 238,
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/da/ea/6c/daea6c92-0990-d691-3283-6f019c4c8529/075679584670.jpg/600x600bb.jpg',
    localCoverName: '600x600bb (4).jpg',
    contentType: 'audio/mpeg'
  },
  {
    fileName: 'Keyshia Cole - Love (Live In Session).mp3',
    title: 'Love (Live In Session)',
    artistName: 'Keyshia Cole',
    artistBio: 'Keyshia Myeshia Cole is an American R&B singer and television personality.',
    albumTitle: 'The Way It Is',
    genre: 'R&B',
    duration: 252,
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/b3/8a/1e/b38a1ee4-c75f-26cd-ce84-6419cdbc819c/06UMGIM24715.rgb.jpg/600x595bb.jpg',
    localCoverName: '600x595bb.jpg',
    contentType: 'audio/mpeg'
  },
  {
    fileName: 'PARTYNEXTDOOR - Belong To The City (Lyrics) [hTzeekwk8FA].mp3',
    title: 'Belong To The City',
    artistName: 'PARTYNEXTDOOR',
    artistBio: 'Jahron Anthony Brathwaite, known professionally as PARTYNEXTDOOR, is a Canadian singer, songwriter, and record producer.',
    albumTitle: 'PARTYNEXTDOOR TWO',
    genre: 'R&B',
    duration: 98,
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/3c/25/65/3c256521-476e-af50-e9a1-6aacbe34b441/93624942191.jpg/600x600bb.jpg',
    localCoverName: '600x600bb (5).jpg',
    contentType: 'audio/mpeg'
  }
];

async function seed() {
  console.log('Connecting to database...');
  const conn = await connectDB();
  const db = conn.connection ? conn.connection.db : conn.db;
  const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'audio' });

  // Clean up any broken previous uploads or duplicates
  console.log('Cleaning up existing or duplicate song records...');
  for (const meta of TRACKS_METADATA) {
    const existing = await Song.find({
      $or: [
        { title: meta.title },
        { title: { $regex: new RegExp(meta.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') } }
      ]
    });

    for (const song of existing) {
      console.log(`Removing old/duplicate song: "${song.title}" (${song._id})`);
      if (song.audioUrl && song.audioUrl.startsWith('/api/songs/audio/')) {
        const fileId = song.audioUrl.replace('/api/songs/audio/', '');
        try {
          await bucket.delete(new mongoose.Types.ObjectId(fileId));
        } catch (_) {}
      }
      await Song.findByIdAndDelete(song._id);
    }
  }

  // Ensure local uploads directory has copies of covers as local fallback
  const localCoversDir = path.resolve(process.cwd(), 'uploads/covers');
  try {
    if (!fs.existsSync(localCoversDir)) fs.mkdirSync(localCoversDir, { recursive: true });
    for (const meta of TRACKS_METADATA) {
      const srcCover = path.join(SONGS_DIR, meta.localCoverName);
      if (fs.existsSync(srcCover)) {
        fs.copyFileSync(srcCover, path.join(localCoversDir, meta.localCoverName));
      }
    }
  } catch (err) {
    console.warn('Could not copy local covers fallback:', err.message);
  }

  console.log('\n--- Uploading songs to MongoDB GridFS and seeding catalogue ---');

  for (const meta of TRACKS_METADATA) {
    const filePath = path.join(COVERS_DIR, meta.fileName);
    if (!fs.existsSync(filePath)) {
      console.error(`Audio file not found: ${filePath}`);
      continue;
    }

    console.log(`\nProcessing: "${meta.artistName} - ${meta.title}"...`);

    // Upload audio file into GridFS
    const uploadStream = bucket.openUploadStream(meta.fileName, {
      contentType: meta.contentType
    });

    await new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(filePath);
      readStream.pipe(uploadStream)
        .on('finish', resolve)
        .on('error', reject);
    });

    const fileId = uploadStream.id;
    console.log(`  ✓ Uploaded to GridFS (ID: ${fileId})`);

    // Artist
    let artist = await Artist.findOne({ name: meta.artistName });
    if (!artist) {
      artist = await Artist.create({
        name: meta.artistName,
        bio: meta.artistBio,
        imageUrl: meta.coverUrl,
        genres: [meta.genre]
      });
      console.log(`  ✓ Created artist: ${artist.name}`);
    }

    // Album
    let album = await Album.findOne({ title: meta.albumTitle, artist: artist._id });
    if (!album) {
      album = await Album.create({
        title: meta.albumTitle,
        artist: artist._id,
        coverUrl: meta.coverUrl,
        releaseDate: new Date(),
        description: `${meta.albumTitle} by ${meta.artistName}`
      });
      console.log(`  ✓ Created album: ${album.title}`);
    }

    // Song
    const song = await Song.create({
      title: meta.title,
      artist: artist._id,
      album: album._id,
      audioUrl: `/api/songs/audio/${fileId}`,
      coverUrl: meta.coverUrl,
      duration: meta.duration,
      genre: meta.genre,
      releaseDate: new Date(),
      licence: 'Personal Library',
      attribution: `${meta.artistName} - ${meta.title}`,
      isPublished: true
    });

    console.log(`  ✓ Created song: "${song.title}" (${song._id})`);
  }

  const totalSongs = await Song.countDocuments();
  console.log(`\nSeeding completed successfully! Total songs in database: ${totalSongs}`);
  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
