// pages/LikedSongs.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext.jsx';
import { likesApi } from '@/services/api/likes.api.js';
import { toCard } from '@/models/card.model.js';
import { Card } from '@/components/cards/Card.jsx';
import { usePlayer } from '@/features/player/context/PlayerContext.jsx';
import { Heart, ArrowLeft, Loader2, Music } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LikedSongs() {
  const { isAuthenticated } = useAuth();
  const { playCard } = usePlayer();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    likesApi.getLikes()
      .then(res => {
        setSongs((res || []).map(s => toCard(s, 'song')));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="w-full h-full pt-32 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
        <span className="text-xs font-mono text-ink-faint">Loading liked songs…</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full pt-20 pb-32 px-6 max-w-5xl mx-auto overflow-y-auto">
      <div className="page-enter">
        <Link
          to="/library"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-faint hover:text-ink transition-colors duration-200 mb-8 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Return to Library</span>
        </Link>
      </div>

      <div className="page-enter flex items-center gap-4 pb-6 mb-8">
        <div className="w-12 h-12 rounded-xl bg-accent-soft border border-accent/20 flex items-center justify-center">
          <Heart className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h1 className="font-serif italic text-3xl font-bold text-ink tracking-tight">
            Liked Songs
          </h1>
          <p className="text-xs font-mono text-ink-faint mt-0.5">
            {songs.length} preserved tracks in your collection
          </p>
        </div>
      </div>

      <div className="accent-line mb-8" />

      <div className="page-enter-delayed">
        {songs.length === 0 ? (
          <div className="empty-state">
            <Heart className="empty-state-icon" />
            <p className="font-serif italic text-lg text-ink-soft">
              Nothing kept yet. Go wander.
            </p>
            <p className="text-xs font-mono text-ink-faint mt-1.5">
              Like songs while listening to save them here.
            </p>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
