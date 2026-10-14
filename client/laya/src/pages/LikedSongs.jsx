// pages/LikedSongs.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { likesApi } from '../services/api/likes.api.js';
import { toCard } from '../models/card.model.js';
import { Card } from '../components/cards/Card.jsx';
import { usePlayer } from '@/features/player/context/PlayerContext.jsx';
import { Heart, ArrowLeft, Loader2 } from 'lucide-react';
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
      <div className="w-full h-full pt-32 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full h-full pt-20 pb-32 px-6 max-w-5xl mx-auto overflow-y-auto">
      <Link
        to="/library"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-soft hover:text-ink mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Library</span>
      </Link>

      <div className="flex items-center gap-3 border-b border-rule pb-4 mb-8">
        <Heart className="w-7 h-7 text-accent fill-accent/20" />
        <div>
          <h1 className="font-serif italic text-3xl font-bold text-ink">
            Liked Songs
          </h1>
          <p className="text-xs font-mono text-ink-soft mt-0.5">
            {songs.length} preserved tracks in your collection
          </p>
        </div>
      </div>

      {songs.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-serif italic text-lg text-ink-soft">
            Nothing kept yet. Go wander.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-6">
          {songs.map((song, idx) => (
            <Card
              key={song.id}
              card={song}
              tilt={(idx % 2 === 0 ? 1 : -1) * 2}
              onClick={() => playCard(song, songs)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
