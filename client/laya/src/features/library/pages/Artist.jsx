// pages/Artist.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { catalogueApi } from '@/services/api/catalogue.api.js';
import { toCard } from '@/models/card.model.js';
import { Card } from '@/components/cards/Card.jsx';
import { usePlayer } from '@/features/player/context/PlayerContext.jsx';
import { ArrowLeft, Loader2, Music, Disc3 } from 'lucide-react';

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
        setArtist(res?.artist || res);
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
      <div className="w-full h-full pt-32 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
        <span className="text-xs font-mono text-ink-faint">Loading artist…</span>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="w-full h-full pt-32 flex flex-col items-center justify-center gap-2">
        <Music className="w-10 h-10 text-ink-faint opacity-40" />
        <p className="font-serif italic text-lg text-ink-soft">Artist not found.</p>
        <Link to="/" className="text-xs font-mono text-accent hover:underline mt-2">
          Return to Table
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full h-full pt-20 pb-32 px-6 max-w-5xl mx-auto overflow-y-auto">
      {/* Back link */}
      <div className="page-enter">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-faint hover:text-ink transition-colors duration-200 mb-8 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Return to Table</span>
        </Link>
      </div>

      {/* Artist Hero */}
      <div className="page-enter flex flex-col md:flex-row gap-8 items-start pb-8 mb-10">
        {/* Avatar */}
        <div className="w-40 h-40 rounded-full overflow-hidden border-2 border-rule/30 shrink-0 shadow-lg ring-4 ring-paper-2/60">
          <img
            src={artist.imageUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400'}
            alt={artist.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="page-enter-delayed">
          <span className="stat-badge mb-3">
            RECORDING ARTIST
          </span>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-ink mt-2 tracking-tight">
            {artist.name}
          </h1>
          {artist.bio && (
            <p className="font-serif italic text-sm text-ink-soft mt-3 max-w-xl leading-relaxed">
              {artist.bio}
            </p>
          )}
          {artist.genres?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {artist.genres.map(g => (
                <span key={g} className="text-[10px] font-mono px-2.5 py-1 bg-paper-2 border border-rule/40 rounded-md text-ink-soft transition-colors hover:border-accent/40 hover:text-ink">
                  {g}
                </span>
              ))}
            </div>
          )}

          {/* Stats row */}
          <div className="flex items-center gap-4 mt-5">
            {albums.length > 0 && (
              <span className="stat-badge">
                <Disc3 className="w-3 h-3" />
                {albums.length} {albums.length === 1 ? 'album' : 'albums'}
              </span>
            )}
            {songs.length > 0 && (
              <span className="stat-badge">
                <Music className="w-3 h-3" />
                {songs.length} {songs.length === 1 ? 'song' : 'songs'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Accent line divider */}
      <div className="accent-line mb-10" />

      {/* Artist Releases */}
      {albums.length > 0 && (
        <div className="mb-12 page-enter-delayed stagger-2">
          <h2 className="section-header font-serif text-lg font-medium text-ink mb-6">
            Albums & Sleeves
          </h2>
          <div className="flex flex-wrap gap-7">
            {albums.map((alb, idx) => (
              <Card
                key={alb.id}
                card={alb}
                tilt={0}
                onClick={() => playCard(alb, albums)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Artist Songs */}
      {songs.length > 0 && (
        <div className="page-enter-delayed stagger-3">
          <h2 className="section-header font-serif text-lg font-medium text-ink mb-6">
            Recorded Songs
          </h2>
          <div className="flex flex-wrap gap-6">
            {songs.map((song, idx) => (
              <Card
                key={song.id}
                card={song}
                tilt={0}
                onClick={() => playCard(song, songs)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
