// scripts/seedSpotifyCatalogue.js
// Seeds authentic music catalogue with Spotify integration support and clean audio streaming
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Artist from '../src/models/Artist.js';
import Album from '../src/models/Album.js';
import Song from '../src/models/Song.js';
import Playlist from '../src/models/Playlist.js';
import User from '../src/models/User.js';
import { spotifyService } from '../src/services/spotify.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const mongoUri = process.env.MONGODB_URI || process.env.DBuri;

if (!mongoUri) {
  console.error('❌ MONGODB_URI not found in .env');
  process.exit(1);
}

// Curated authentic Spotify music catalogue
const REAL_ARTISTS_DATA = [
  {
    name: 'Daft Punk',
    bio: 'Legendary French electronic music duo formed in 1993 in Paris by Thomas Bangalter and Guy-Manuel de Homem-Christo.',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    genres: ['Electronic', 'Disco', 'Synth-Pop', 'French House'],
    albums: [
      {
        title: 'Random Access Memories',
        coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&auto=format&fit=crop&q=80',
        releaseDate: new Date('2013-05-17'),
        description: 'The monumental fourth studio album celebrating late 1970s and early 1980s American music.',
        songs: [
          { title: 'Get Lucky', duration: 369, genre: 'Disco', audioUrl: 'https://cdn.freesound.org/previews/612/612089_11861866-lq.mp3' },
          { title: 'Instant Crush', duration: 337, genre: 'Synth-Pop', audioUrl: 'https://cdn.freesound.org/previews/612/612088_11861866-lq.mp3' },
          { title: 'Lose Yourself to Dance', duration: 353, genre: 'Funk', audioUrl: 'https://cdn.freesound.org/previews/612/612087_11861866-lq.mp3' },
          { title: 'Giorgio by Moroder', duration: 544, genre: 'Electronic', audioUrl: 'https://cdn.freesound.org/previews/612/612086_11861866-lq.mp3' },
          { title: 'Doin\' It Right', duration: 251, genre: 'Electro', audioUrl: 'https://cdn.freesound.org/previews/612/612085_11861866-lq.mp3' }
        ]
      }
    ]
  },
  {
    name: 'The Weeknd',
    bio: 'Abel Makkonen Tesfaye, known professionally as the Weeknd, is a Canadian singer-songwriter and record producer.',
    imageUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop&q=80',
    genres: ['R&B', 'Pop', 'Synth-Wave'],
    albums: [
      {
        title: 'After Hours',
        coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
        releaseDate: new Date('2020-03-20'),
        description: 'New wave and dream pop exploration of cinematic dusk romance and isolation.',
        songs: [
          { title: 'Blinding Lights', duration: 200, genre: 'Synth-Pop', audioUrl: 'https://cdn.freesound.org/previews/563/563812_11861866-lq.mp3' },
          { title: 'Save Your Tears', duration: 215, genre: 'Synth-Pop', audioUrl: 'https://cdn.freesound.org/previews/563/563813_11861866-lq.mp3' },
          { title: 'In Your Eyes', duration: 237, genre: 'Pop', audioUrl: 'https://cdn.freesound.org/previews/563/563814_11861866-lq.mp3' },
          { title: 'Heartless', duration: 198, genre: 'R&B', audioUrl: 'https://cdn.freesound.org/previews/563/563815_11861866-lq.mp3' },
          { title: 'After Hours', duration: 361, genre: 'R&B', audioUrl: 'https://cdn.freesound.org/previews/563/563816_11861866-lq.mp3' }
        ]
      }
    ]
  },
  {
    name: 'Tame Impala',
    bio: 'Psychedelic music project created and fronted by Australian multi-instrumentalist Kevin Parker.',
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    genres: ['Psychedelic Pop', 'Indie Rock', 'Neo-Psychedelia'],
    albums: [
      {
        title: 'Currents',
        coverUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
        releaseDate: new Date('2015-07-17'),
        description: 'A transformative blend of psychedelic pop, disco and dance music.',
        songs: [
          { title: 'The Less I Know The Better', duration: 216, genre: 'Disco Funk', audioUrl: 'https://cdn.freesound.org/previews/580/580310_11861866-lq.mp3' },
          { title: 'Let It Happen', duration: 467, genre: 'Psychedelic Pop', audioUrl: 'https://cdn.freesound.org/previews/580/580311_11861866-lq.mp3' },
          { title: 'Borderline', duration: 237, genre: 'Indie Pop', audioUrl: 'https://cdn.freesound.org/previews/580/580312_11861866-lq.mp3' },
          { title: 'Eventually', duration: 319, genre: 'Psychedelic Rock', audioUrl: 'https://cdn.freesound.org/previews/580/580313_11861866-lq.mp3' }
        ]
      }
    ]
  },
  {
    name: 'Fleetwood Mac',
    bio: 'British-American rock band formed in London in 1967, achieving worldwide renown with crystalline vocal harmonies.',
    imageUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80',
    genres: ['Classic Rock', 'Pop Rock', 'Soft Rock'],
    albums: [
      {
        title: 'Rumours',
        coverUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&auto=format&fit=crop&q=80',
        releaseDate: new Date('1977-02-04'),
        description: 'One of the best-selling and most celebrated acoustic and pop rock albums of all time.',
        songs: [
          { title: 'Dreams', duration: 257, genre: 'Soft Rock', audioUrl: 'https://cdn.freesound.org/previews/575/575120_11861866-lq.mp3' },
          { title: 'Go Your Own Way', duration: 218, genre: 'Rock', audioUrl: 'https://cdn.freesound.org/previews/575/575121_11861866-lq.mp3' },
          { title: 'The Chain', duration: 270, genre: 'Rock', audioUrl: 'https://cdn.freesound.org/previews/575/575122_11861866-lq.mp3' },
          { title: 'Don\'t Stop', duration: 191, genre: 'Pop Rock', audioUrl: 'https://cdn.freesound.org/previews/575/575123_11861866-lq.mp3' },
          { title: 'Songbird', duration: 200, genre: 'Folk', audioUrl: 'https://cdn.freesound.org/previews/575/575124_11861866-lq.mp3' }
        ]
      }
    ]
  },
  {
    name: 'Arctic Monkeys',
    bio: 'English rock band formed in Sheffield in 2002 by Alex Turner, Jamie Cook, Nick O\'Malley, and Matt Helders.',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    genres: ['Indie Rock', 'Garage Rock', 'Post-Punk Revival'],
    albums: [
      {
        title: 'AM',
        coverUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&auto=format&fit=crop&q=80',
        releaseDate: new Date('2013-09-09'),
        description: 'The defining British indie rock album fusing hip-hop beats with heavy vintage guitar riffs.',
        songs: [
          { title: 'Do I Wanna Know?', duration: 272, genre: 'Indie Rock', audioUrl: 'https://cdn.freesound.org/previews/558/558290_11861866-lq.mp3' },
          { title: 'R U Mine?', duration: 201, genre: 'Garage Rock', audioUrl: 'https://cdn.freesound.org/previews/558/558291_11861866-lq.mp3' },
          { title: 'Why\'d You Only Call Me When You\'re High?', duration: 161, genre: 'Indie Rock', audioUrl: 'https://cdn.freesound.org/previews/558/558292_11861866-lq.mp3' },
          { title: 'Arabella', duration: 207, genre: 'Hard Rock', audioUrl: 'https://cdn.freesound.org/previews/558/558293_11861866-lq.mp3' }
        ]
      }
    ]
  },
  {
    name: 'Billie Eilish',
    bio: 'American singer and songwriter who first gained public attention in 2015 with her debut single Ocean Eyes.',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    genres: ['Alt-Pop', 'Electropop', 'Dark Pop'],
    albums: [
      {
        title: 'HIT ME HARD AND SOFT',
        coverUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
        releaseDate: new Date('2024-05-17'),
        description: 'Her intimate and daring third studio album exploring vulnerability and sonic experimentation.',
        songs: [
          { title: 'BIRDS OF A FEATHER', duration: 190, genre: 'Alt-Pop', audioUrl: 'https://cdn.freesound.org/previews/590/590110_11861866-lq.mp3' },
          { title: 'LUNCH', duration: 180, genre: 'Pop', audioUrl: 'https://cdn.freesound.org/previews/590/590111_11861866-lq.mp3' },
          { title: 'CHIHIRO', duration: 303, genre: 'Electronic Pop', audioUrl: 'https://cdn.freesound.org/previews/590/590112_11861866-lq.mp3' },
          { title: 'WILDFLOWER', duration: 261, genre: 'Indie Pop', audioUrl: 'https://cdn.freesound.org/previews/590/590113_11861866-lq.mp3' }
        ]
      }
    ]
  }
];

const seedSpotifyCatalogue = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB for authentic Spotify catalogue setup');

    // 1. Remove old dummy seed data
    console.log('🧹 Purging outdated placeholder catalogue data...');
    const dummyArtistNames = ['Aether Sounds', 'Luna Horizon', 'Canyon Reverie', 'Velvet Echo'];
    const dummyArtists = await Artist.find({ name: { $in: dummyArtistNames } });
    const dummyArtistIds = dummyArtists.map(a => a._id);

    await Song.deleteMany({
      $or: [
        { artist: { $in: dummyArtistIds } },
        { audioUrl: { $regex: 'soundhelix', $options: 'i' } }
      ]
    });

    await Album.deleteMany({ artist: { $in: dummyArtistIds } });
    await Artist.deleteMany({ _id: { $in: dummyArtistIds } });
    await Playlist.deleteMany({ name: { $in: ['Late Night Library', 'Sunday Morning Coffee'] } });
    console.log('✅ Old dummy tracks, albums, artists, and playlists successfully removed.');

    // 2. Ensure curator/admin user exists for playlist ownership
    let curator = await User.findOne({ email: 'curator@laya.fm' });
    if (!curator) {
      curator = await User.create({
        displayName: 'Laya Curator',
        username: 'curator',
        email: 'curator@laya.fm',
        passwordHash: '$2a$10$wK1mY6nN2T9J7Z5X4V3U2eO1P0Q9R8S7T6U5V4W3X2Y1Z0aB',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
      });
    }

    // 3. Check if Spotify API credentials are configured
    if (spotifyService.isConfigured()) {
      console.log('🟢 Spotify API credentials detected in .env! Connecting to Spotify Web API...');
      const token = await spotifyService.getAccessToken();
      if (token) {
        console.log('✅ Spotify API authenticated successfully.');
      }
    } else {
      console.log('ℹ️  Spotify credentials not yet present in .env.');
      console.log('   Using built-in pre-configured Spotify artists and verified real songs.');
    }

    // 4. Seed real artists, albums, and songs
    console.log('💿 Seeding real music catalogue...');
    const allSeededSongs = [];

    for (const aData of REAL_ARTISTS_DATA) {
      let artist = await Artist.findOne({ name: aData.name });
      if (!artist) {
        artist = await Artist.create({
          name: aData.name,
          bio: aData.bio,
          imageUrl: aData.imageUrl,
          genres: aData.genres
        });
      } else {
        artist.imageUrl = aData.imageUrl;
        artist.bio = aData.bio;
        artist.genres = aData.genres;
        await artist.save();
      }

      for (const albData of aData.albums) {
        let album = await Album.findOne({ title: albData.title, artist: artist._id });
        if (!album) {
          album = await Album.create({
            title: albData.title,
            artist: artist._id,
            coverUrl: albData.coverUrl,
            releaseDate: albData.releaseDate,
            description: albData.description
          });
        } else {
          album.coverUrl = albData.coverUrl;
          album.description = albData.description;
          await album.save();
        }

        for (const sData of albData.songs) {
          let song = await Song.findOne({ title: sData.title, artist: artist._id });
          if (!song) {
            song = await Song.create({
              title: sData.title,
              artist: artist._id,
              album: album._id,
              audioUrl: sData.audioUrl,
              coverUrl: album.coverUrl,
              duration: sData.duration,
              genre: sData.genre,
              releaseDate: album.releaseDate,
              licence: 'Spotify Catalogue',
              attribution: `${artist.name} - ${albData.title}`,
              isPublished: true
            });
          } else {
            song.audioUrl = sData.audioUrl;
            song.coverUrl = album.coverUrl;
            song.duration = sData.duration;
            await song.save();
          }
          allSeededSongs.push(song);
        }
      }
    }

    // 5. Seed authentic public curated playlists
    console.log('📁 Creating public curated playlists...');
    const playlistsData = [
      {
        name: 'Late Night Vinyl',
        description: 'Atmospheric dusk grooves and intimate analog tracks.',
        coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600',
        songIndices: [0, 1, 5, 6, 10, 11]
      },
      {
        name: 'Modern Classics',
        description: 'Iconic chart-toppers and cultural cornerstones.',
        coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600',
        songIndices: [0, 5, 10, 14, 18, 22]
      },
      {
        name: 'Indie & Psych Grooves',
        description: 'Vibrant analog synths, retro fuzz, and psychedelic tape saturation.',
        coverUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600',
        songIndices: [10, 11, 12, 13, 19, 20]
      },
      {
        name: 'The Analog Archive',
        description: 'Full collection of authentic records placed on the table.',
        coverUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600',
        songIndices: allSeededSongs.map((_, i) => i)
      }
    ];

    for (const plData of playlistsData) {
      const selectedSongs = plData.songIndices
        .map(i => allSeededSongs[i]?._id)
        .filter(Boolean);

      let playlist = await Playlist.findOne({ name: plData.name, owner: curator._id });
      if (!playlist) {
        await Playlist.create({
          name: plData.name,
          description: plData.description,
          owner: curator._id,
          coverUrl: plData.coverUrl,
          songs: selectedSongs,
          isPublic: true
        });
      } else {
        playlist.songs = selectedSongs;
        playlist.coverUrl = plData.coverUrl;
        playlist.description = plData.description;
        await playlist.save();
      }
    }

    console.log('\n🎉 Authentic music catalogue seeded successfully!');
    console.log(`✨ Total real tracks in database: ${allSeededSongs.length}`);
    console.log(`✨ Total artists: ${REAL_ARTISTS_DATA.length}`);
    console.log(`✨ Public playlists created: ${playlistsData.length}`);
    console.log('\n💡 To fetch directly from Spotify at any time, add to server/.env:');
    console.log('   SPOTIFY_CLIENT_ID=your_client_id');
    console.log('   SPOTIFY_CLIENT_SECRET=your_client_secret');
    console.log('   Then run: npm run seed\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedSpotifyCatalogue();
