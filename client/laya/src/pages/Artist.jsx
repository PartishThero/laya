// pages/Artist.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { catalogueApi } from '../services/api/catalogue.api.js';
import { toCard } from '../models/card.model.js';
import { Card } from '../components/cards/Card.jsx';
import { usePlayer } from '../context/PlayerContext.jsx';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function Artist() {
  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playCard } = usePlayer();

  useEffect(() => {
    catalogueApi.getArtist(id)
      .then(res => {
        setArtist(res);
        return Promise.all([
          catalogueApi.getSongs({ artist: id }),
          catalogueApi.getAlbums({ artist: id })
        ]);
      })
      .then(([songsRes, albumsRes]) => {
        setSongs((songsRes.songs || []).map(s => toCard(s, 'song')));
        setAlbums((albumsRes.albums || []).map(a => toCard(a, 'album')));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="w-full h-full pt-32 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="w-full h-full pt-32 text-center">
        <p className="font-serif italic text-lg text-ink-soft">Artist not found.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full pt-20 pb-32 px-6 max-w-5xl mx-auto overflow-y-auto">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-soft hover:text-ink mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Table</span>
      </Link>

      <div className="flex flex-col md:flex-row gap-6 items-start border-b border-rule pb-6 mb-8">
        <div className="w-36 h-36 rounded-full overflow-hidden border-2 border-rule shrink-0 shadow-md">
          <img
            src={artist.imageUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400'}
            alt={artist.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-ink-soft">
            RECORDING ARTIST
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-ink mt-1">
            {artist.name}
          </h1>
          <p className="font-serif italic text-sm text-ink-soft mt-2 max-w-xl">
            {artist.bio}
          </p>
          {artist.genres?.length > 0 && (
            <div className="flex gap-2 mt-3">
              {artist.genres.map(g => (
                <span key={g} className="text-[10px] font-mono px-2 py-0.5 bg-paper-2 border border-rule/60 rounded-xs text-ink-soft">
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Artist Releases */}
      {albums.length > 0 && (
        <div className="mb-10">
          <h2 className="font-serif text-lg font-medium text-ink mb-4">
            Albums & Sleeves
          </h2>
          <div className="flex flex-wrap gap-6">
            {albums.map((alb, idx) => (
              <Card
                key={alb.id}
                card={alb}
                tilt={(idx % 2 === 0 ? 1 : -1) * 2}
                onClick={() => playCard(alb, albums)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Artist Songs */}
      {songs.length > 0 && (
        <div>
          <h2 className="font-serif text-lg font-medium text-ink mb-4">
            Recorded Songs
          </h2>
          <div className="flex flex-wrap gap-6">
            {songs.map((song, idx) => (
              <Card
                key={song.id}
                card={song}
                tilt={(idx % 2 === 0 ? -1.5 : 1.5)}
                onClick={() => playCard(song, songs)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
