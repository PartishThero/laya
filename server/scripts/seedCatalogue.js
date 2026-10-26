// scripts/seedCatalogue.js
// Seeds the database with rich, royalty-free analog tracks, albums, artists, and playlists
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import Artist from '../src/models/Artist.js';
import Album from '../src/models/Album.js';
import Song from '../src/models/Song.js';
import Playlist from '../src/models/Playlist.js';
import User from '../src/models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const mongoUri = process.env.MONGODB_URI || process.env.DBuri;

if (!mongoUri) {
  console.error('❌ MONGODB_URI or DBuri not found in .env');
  process.exit(1);
}

const seed = async () => {
  try {
    await mongoose.connect(mongoUri, { family: 4 });
    console.log('✅ Connected to MongoDB for rich catalogue seeding');

    // 1. Seed Recording Artists
    const artistsData = [
      {
        name: 'Aether Sounds',
        bio: 'Ambient and electronic soundscapes designed for focus, analog clarity, and calm.',
        imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
        genres: ['Ambient', 'Electronic', 'Downtempo']
      },
      {
        name: 'Luna Horizon',
        bio: 'Lo-fi chill beats and organic acoustic textures recorded to tape.',
        imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80',
        genres: ['Lo-Fi', 'Chillhop', 'Acoustic']
      },
      {
        name: 'Canyon Reverie',
        bio: 'Warm acoustic fingerpicking and delicate folk arrangements recorded in cabin isolation.',
        imageUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500&auto=format&fit=crop&q=80',
        genres: ['Indie Folk', 'Acoustic', 'Fingerstyle']
      },
      {
        name: 'Velvet Echo',
        bio: 'Dusk neo-soul chords, vintage Rhodes electric piano, and mellow tape grooves.',
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
        genres: ['Neo-Soul', 'Jazz', 'Downtempo']
      }
    ];

    const savedArtists = [];
    for (const a of artistsData) {
      let artist = await Artist.findOne({ name: a.name });
      if (!artist) {
        artist = await Artist.create(a);
      } else {
        artist.imageUrl = a.imageUrl;
        artist.bio = a.bio;
        artist.genres = a.genres;
        await artist.save();
      }
      savedArtists.push(artist);
    }

    // 2. Seed Albums
    const albumsData = [
      {
        title: 'Morning Reflections',
        artist: savedArtists[0]._id,
        coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
        description: 'Atmospheric warmth and delicate synthesis for early mornings.',
        releaseDate: new Date('2024-01-15')
      },
      {
        title: 'Midnight Coffee',
        artist: savedArtists[1]._id,
        coverUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&auto=format&fit=crop&q=80',
        description: 'Late night lo-fi grooves for night owls and quiet readers.',
        releaseDate: new Date('2024-02-20')
      },
      {
        title: 'Canyon Pines',
        artist: savedArtists[2]._id,
        coverUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=500&auto=format&fit=crop&q=80',
        description: 'Analog acoustic guitar recorded in intimate cabin isolation.',
        releaseDate: new Date('2024-03-10')
      },
      {
        title: 'Slow Twilight',
        artist: savedArtists[3]._id,
        coverUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500&auto=format&fit=crop&q=80',
        description: 'Mellow electric piano and gentle drums for the evening blue hour.',
        releaseDate: new Date('2024-04-05')
      }
    ];

    const savedAlbums = [];
    for (const alb of albumsData) {
      let album = await Album.findOne({ title: alb.title, artist: alb.artist });
      if (!album) {
        album = await Album.create(alb);
      } else {
        album.coverUrl = alb.coverUrl;
        album.description = alb.description;
        await album.save();
      }
      savedAlbums.push(album);
    }

    // 3. Seed Songs with open-source audio streams
    const songsData = [
      // Album 1 (Aether Sounds - Morning Reflections)
      {
        title: 'Cascade of Light',
        artist: savedArtists[0]._id,
        album: savedAlbums[0]._id,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        coverUrl: savedAlbums[0].coverUrl,
        duration: 372,
        genre: 'Ambient',
        licence: 'CC BY 4.0',
        attribution: 'SoundHelix Open Audio',
        isPublished: true
      },
      {
        title: 'Drifting Petals',
        artist: savedArtists[0]._id,
        album: savedAlbums[0]._id,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        coverUrl: savedAlbums[0].coverUrl,
        duration: 423,
        genre: 'Ambient',
        licence: 'CC BY 4.0',
        attribution: 'SoundHelix Open Audio',
        isPublished: true
      },
      {
        title: 'Still Horizon',
        artist: savedArtists[0]._id,
        album: savedAlbums[0]._id,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        coverUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop&q=80',
        duration: 310,
        genre: 'Ambient',
        licence: 'CC BY 4.0',
        attribution: 'SoundHelix Open Audio',
        isPublished: true
      },

      // Album 2 (Luna Horizon - Midnight Coffee)
      {
        title: 'Rain on the Rooftop',
        artist: savedArtists[1]._id,
        album: savedAlbums[1]._id,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        coverUrl: savedAlbums[1].coverUrl,
        duration: 345,
        genre: 'Lo-Fi',
        licence: 'CC BY 4.0',
        attribution: 'SoundHelix Open Audio',
        isPublished: true
      },
      {
        title: 'Corner Table Reverie',
        artist: savedArtists[1]._id,
        album: savedAlbums[1]._id,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
        coverUrl: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=500&auto=format&fit=crop&q=80',
        duration: 290,
        genre: 'Lo-Fi',
        licence: 'CC BY 4.0',
        attribution: 'SoundHelix Open Audio',
        isPublished: true
      },
      {
        title: 'Steam & Cinnamon',
        artist: savedArtists[1]._id,
        album: savedAlbums[1]._id,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
        coverUrl: savedAlbums[1].coverUrl,
        duration: 315,
        genre: 'Lo-Fi',
        licence: 'CC BY 4.0',
        attribution: 'SoundHelix Open Audio',
        isPublished: true
      },

      // Album 3 (Canyon Reverie - Canyon Pines)
      {
        title: 'Pines in Morning Mist',
        artist: savedArtists[2]._id,
        album: savedAlbums[2]._id,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
        coverUrl: savedAlbums[2].coverUrl,
        duration: 275,
        genre: 'Indie Folk',
        licence: 'CC BY 4.0',
        attribution: 'SoundHelix Open Audio',
        isPublished: true
      },
      {
        title: 'Wooden Porch Steps',
        artist: savedArtists[2]._id,
        album: savedAlbums[2]._id,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
        coverUrl: 'https://images.unsplash.com/photo-1510784722466-f2aa9c52fff6?w=500&auto=format&fit=crop&q=80',
        duration: 330,
        genre: 'Indie Folk',
        licence: 'CC BY 4.0',
        attribution: 'SoundHelix Open Audio',
        isPublished: true
      },
      {
        title: 'Fading Ember',
        artist: savedArtists[2]._id,
        album: savedAlbums[2]._id,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
        coverUrl: savedAlbums[2].coverUrl,
        duration: 298,
        genre: 'Indie Folk',
        licence: 'CC BY 4.0',
        attribution: 'SoundHelix Open Audio',
        isPublished: true
      },

      // Album 4 (Velvet Echo - Slow Twilight)
      {
        title: 'Blue Hour Velvet',
        artist: savedArtists[3]._id,
        album: savedAlbums[3]._id,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
        coverUrl: savedAlbums[3].coverUrl,
        duration: 360,
        genre: 'Neo-Soul',
        licence: 'CC BY 4.0',
        attribution: 'SoundHelix Open Audio',
        isPublished: true
      },
      {
        title: 'Amber Streetlights',
        artist: savedArtists[3]._id,
        album: savedAlbums[3]._id,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
        coverUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=500&auto=format&fit=crop&q=80',
        duration: 340,
        genre: 'Neo-Soul',
        licence: 'CC BY 4.0',
        attribution: 'SoundHelix Open Audio',
        isPublished: true
      },
      {
        title: 'Warm Analog Tape',
        artist: savedArtists[3]._id,
        album: savedAlbums[3]._id,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
        coverUrl: savedAlbums[3].coverUrl,
        duration: 388,
        genre: 'Neo-Soul',
        licence: 'CC BY 4.0',
        attribution: 'SoundHelix Open Audio',
        isPublished: true
      }
    ];

    const savedSongs = [];
    for (const s of songsData) {
      let song = await Song.findOne({ title: s.title, artist: s.artist });
      if (!song) {
        song = await Song.create(s);
      } else {
        song.audioUrl = s.audioUrl;
        song.coverUrl = s.coverUrl;
        song.album = s.album;
        song.genre = s.genre;
        song.duration = s.duration;
        await song.save();
      }
      savedSongs.push(song);
    }

    // 4. Link album tracks
    for (let i = 0; i < savedAlbums.length; i++) {
      const albSongs = savedSongs.filter(s => s.album.toString() === savedAlbums[i]._id.toString());
      savedAlbums[i].tracks = albSongs.map(s => s._id);
      await savedAlbums[i].save();
    }

    // 5. Ensure a demo curator user exists
    let demoUser = await User.findOne({ username: 'curator' });
    if (!demoUser) {
      const passwordHash = await bcrypt.hash('curator1234', 10);
      demoUser = await User.create({
        username: 'curator',
        email: 'curator@laya.fm',
        passwordHash,
        displayName: 'Laya Archive',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
      });
    }

    // 6. Seed Public Playlists
    const playlistsData = [
      {
        name: 'Late Night Library',
        description: 'Analog and warm recordings for uninterrupted focus and nocturnal reading.',
        owner: demoUser._id,
        isPublic: true,
        coverUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&auto=format&fit=crop&q=80',
        songs: [savedSongs[0]._id, savedSongs[3]._id, savedSongs[6]._id, savedSongs[9]._id]
      },
      {
        name: 'Sunday Morning Coffee',
        description: 'Gentle acoustic warmth and quiet ambient drifting.',
        owner: demoUser._id,
        isPublic: true,
        coverUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&auto=format&fit=crop&q=80',
        songs: [savedSongs[1]._id, savedSongs[4]._id, savedSongs[7]._id, savedSongs[10]._id]
      }
    ];

    for (const p of playlistsData) {
      let playlist = await Playlist.findOne({ name: p.name, owner: p.owner });
      if (!playlist) {
        await Playlist.create(p);
      } else {
        playlist.songs = p.songs;
        playlist.coverUrl = p.coverUrl;
        playlist.description = p.description;
        await playlist.save();
      }
    }

    console.log(`✨ Successfully seeded:`);
    console.log(`   - ${savedArtists.length} Artists`);
    console.log(`   - ${savedAlbums.length} Albums`);
    console.log(`   - ${savedSongs.length} Songs`);
    console.log(`   - 2 Public Playlists`);
    console.log(`   - Demo Curator Account (username: curator, password: curator1234)`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seed();
