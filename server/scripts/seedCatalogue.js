// scripts/seedCatalogue.js
// Seeds the database with curated R&B, Soul, and Indie tracks matching the user's Spotify playlist
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
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB for Spotify-inspired catalogue seeding');

    // 1. Seed Artists
    const artistsData = [
      {
        name: 'PARTYNEXTDOOR',
        bio: 'Canadian singer, songwriter, and producer known for moody nocturnal R&B, atmospheric synths, and melodic hooks.',
        imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
        genres: ['Contemporary R&B', 'Hip Hop', 'Trap']
      },
      {
        name: 'Bryson Tiller',
        bio: 'Singer and rapper who pioneered the "TrapSoul" aesthetic, blending melodic 90s R&B with 808 trap percussion.',
        imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
        genres: ['TrapSoul', 'Contemporary R&B']
      },
      {
        name: 'Brent Faiyaz',
        bio: 'Grammy-nominated American singer and lead vocalist of Sonder, celebrated for his warm falsetto and introspective lyrics.',
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
        genres: ['R&B', 'Neo-Soul', 'Alternative R&B']
      },
      {
        name: 'Frank Ocean',
        bio: 'Visionary singer-songwriter renowned for his idiosyncratic musical style, avant-garde introspection, and elliptical lyrics.',
        imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
        genres: ['Neo-Soul', 'Alternative R&B', 'Psychedelic Pop']
      },
      {
        name: 'Kehlani',
        bio: 'American singer and dancer with honeyed vocals, candid storytelling, and lush contemporary West Coast R&B arrangements.',
        imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
        genres: ['Contemporary R&B', 'Pop', 'Soul']
      },
      {
        name: 'Childish Gambino',
        bio: 'Multi-hyphenate artist Donald Glover delivering funk, psychedelic soul, and nostalgic analogue arrangements.',
        imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80',
        genres: ['Psychedelic Soul', 'Funk', 'R&B']
      },
      {
        name: 'Jhené Aiko',
        bio: 'Californian singer-songwriter recognized for gentle, ethereal acoustic-R&B phrasing and crystal singing bowl harmonies.',
        imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&auto=format&fit=crop&q=80',
        genres: ['Alternative R&B', 'Neo-Soul']
      },
      {
        name: 'BROCKHAMPTON',
        bio: 'Trailblazing American alternative hip-hop collective fusing melodic hooks, eclectic beats, and analog texture.',
        imageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&auto=format&fit=crop&q=80',
        genres: ['Alternative Hip Hop', 'Indie Pop']
      },
      {
        name: 'Keyshia Cole',
        bio: 'Platinum-selling soul vocalist revered for raw, powerhouse vocals and classic 2000s R&B storytelling.',
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
        genres: ['Soul', 'R&B']
      },
      {
        name: 'Jeff Buckley',
        bio: 'Iconic American vocalist and guitarist praised for his sweeping multi-octave range and intimate analog recordings.',
        imageUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80',
        genres: ['Alternative Rock', 'Folk Rock', 'Soul']
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
        title: 'PARTYNEXTDOOR TWO',
        artist: savedArtists[0]._id,
        coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
        description: 'Nocturnal ambient R&B and filtered 808s from Toronto.',
        releaseDate: new Date('2014-07-29')
      },
      {
        title: 'T.R.A.P.S.O.U.L',
        artist: savedArtists[1]._id,
        coverUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop&q=80',
        description: 'The definitive debut merging slow-tempo trap grooves with classic soul crooning.',
        releaseDate: new Date('2015-10-02')
      },
      {
        title: 'Larger Than Life',
        artist: savedArtists[2]._id,
        coverUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
        description: 'Warm tape saturation, 2000s R&B samples, and seamless vocal harmonies.',
        releaseDate: new Date('2023-10-27')
      },
      {
        title: 'channel ORANGE',
        artist: savedArtists[3]._id,
        coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
        description: 'Grammy-winning masterwork exploring love, summer haze, and analog warmth.',
        releaseDate: new Date('2012-07-10')
      },
      {
        title: 'Folded',
        artist: savedArtists[4]._id,
        coverUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
        description: 'Silky, intimate vocals and candid acoustic ballads.',
        releaseDate: new Date('2024-04-12')
      },
      {
        title: '"Awaken, My Love!"',
        artist: savedArtists[5]._id,
        coverUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80',
        description: 'Psychedelic soul, heavy wah guitars, and 1970s Parliament-Funkadelic inspiration.',
        releaseDate: new Date('2016-12-02')
      },
      {
        title: 'Trip',
        artist: savedArtists[6]._id,
        coverUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&auto=format&fit=crop&q=80',
        description: 'An acoustic-psychedelic journey through grief, love, and healing.',
        releaseDate: new Date('2017-09-22')
      },
      {
        title: 'SATURATION II',
        artist: savedArtists[7]._id,
        coverUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&auto=format&fit=crop&q=80',
        description: 'Eclectic boyband hip-hop full of hooks, infectious acoustic strums, and energy.',
        releaseDate: new Date('2017-08-25')
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
        album.releaseDate = alb.releaseDate;
        await album.save();
      }
      savedAlbums.push(album);
    }

    // 3. Seed Songs with verified high-speed MP3 audio streams
    const songsData = [
      {
        title: 'Belong to the City',
        artist: savedArtists[0]._id,
        album: savedAlbums[0]._id,
        duration: 98,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
        genre: 'R&B / Soul',
        isPublished: true
      },
      {
        title: 'TBH',
        artist: savedArtists[0]._id,
        album: savedAlbums[0]._id,
        duration: 125,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
        genre: 'R&B / Soul',
        isPublished: true
      },
      {
        title: "Don't",
        artist: savedArtists[1]._id,
        album: savedAlbums[1]._id,
        duration: 198,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        coverUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop&q=80',
        genre: 'TrapSoul',
        isPublished: true
      },
      {
        title: 'Best Time',
        artist: savedArtists[2]._id,
        album: savedAlbums[2]._id,
        duration: 102,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        coverUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
        genre: 'R&B / Soul',
        isPublished: true
      },
      {
        title: 'Trust',
        artist: savedArtists[2]._id,
        album: savedAlbums[2]._id,
        duration: 158,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
        coverUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
        genre: 'R&B / Soul',
        isPublished: true
      },
      {
        title: 'Paper Soldier (feat. Joony)',
        artist: savedArtists[2]._id,
        album: savedAlbums[2]._id,
        duration: 232,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
        coverUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
        genre: 'R&B / Soul',
        isPublished: true
      },
      {
        title: 'Bad Religion',
        artist: savedArtists[3]._id,
        album: savedAlbums[3]._id,
        duration: 175,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
        coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
        genre: 'Neo-Soul',
        isPublished: true
      },
      {
        title: 'Pink Matter (feat. André 3000)',
        artist: savedArtists[3]._id,
        album: savedAlbums[3]._id,
        duration: 268,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
        coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
        genre: 'Neo-Soul',
        isPublished: true
      },
      {
        title: 'Folded',
        artist: savedArtists[4]._id,
        album: savedAlbums[4]._id,
        duration: 188,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
        coverUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
        genre: 'Contemporary R&B',
        isPublished: true
      },
      {
        title: 'back of the club',
        artist: savedArtists[4]._id,
        album: savedAlbums[4]._id,
        duration: 275,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
        coverUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
        genre: 'Contemporary R&B',
        isPublished: true
      },
      {
        title: 'Redbone',
        artist: savedArtists[5]._id,
        album: savedAlbums[5]._id,
        duration: 326,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
        coverUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80',
        genre: 'Psychedelic Soul',
        isPublished: true
      },
      {
        title: 'Sativa (feat. Swae Lee)',
        artist: savedArtists[6]._id,
        album: savedAlbums[6]._id,
        duration: 278,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
        coverUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&auto=format&fit=crop&q=80',
        genre: 'Alternative R&B',
        isPublished: true
      },
      {
        title: 'Sweet',
        artist: savedArtists[7]._id,
        album: savedAlbums[7]._id,
        duration: 270,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3',
        coverUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&auto=format&fit=crop&q=80',
        genre: 'Alternative Hip Hop',
        isPublished: true
      },
      {
        title: 'Love',
        artist: savedArtists[8]._id,
        duration: 255,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3',
        coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
        genre: 'Soul / R&B',
        isPublished: true
      },
      {
        title: 'Everybody Here Wants You',
        artist: savedArtists[9]._id,
        duration: 287,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3',
        coverUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80',
        genre: 'Alternative Rock / Soul',
        isPublished: true
      },
      {
        title: 'One Night Only',
        artist: savedArtists[2]._id,
        duration: 195,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3',
        coverUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
        genre: 'R&B / Soul',
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

    // 4. Ensure demo curator exists
    let demoUser = await User.findOne({ username: 'curator' });
    if (!demoUser) {
      const passwordHash = await bcrypt.hash('curator1234', 10);
      demoUser = await User.create({
        username: 'curator',
        email: 'curator@laya.fm',
        passwordHash,
        displayName: 'Laya Curator',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
      });
    }

    // 5. Seed "Liked Songs" and "Late Night R&B" playlists
    const playlistsData = [
      {
        name: 'Liked Songs',
        description: 'Curated favorites matching your personal Spotify library.',
        owner: demoUser._id,
        isPublic: true,
        coverUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
        songs: savedSongs.map(s => s._id)
      },
      {
        name: 'Late Night R&B & Soul',
        description: 'Smooth, late-night atmospheric records for analog listening.',
        owner: demoUser._id,
        isPublic: true,
        coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
        songs: [savedSongs[0]._id, savedSongs[2]._id, savedSongs[3]._id, savedSongs[6]._id, savedSongs[10]._id]
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

    // 6. Also link these liked songs to user '123' if registered
    const user123 = await User.findOne({ username: '123' });
    if (user123) {
      user123.likedSongs = savedSongs.slice(0, 8).map(s => s._id);
      await user123.save();
      console.log('✅ Added curated favorites to user 123 profile');
    }

    console.log(`✨ Successfully seeded Spotify-inspired catalogue:`);
    console.log(`   - ${savedArtists.length} Artists (Brent Faiyaz, Frank Ocean, Bryson Tiller, Kehlani, PARTYNEXTDOOR, etc.)`);
    console.log(`   - ${savedAlbums.length} Albums`);
    console.log(`   - ${savedSongs.length} Playable Stream Tracks`);
    console.log(`   - 2 Playlists (including "Liked Songs")`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seed();
