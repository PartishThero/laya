// pages/Library.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext.jsx';
import { playlistsApi } from '../services/api/playlists.api.js';
import { likesApi } from '../services/api/likes.api.js';
import { historyApi } from '../services/api/history.api.js';
import { toCard } from '../models/card.model.js';
import { Card } from '../components/cards/Card.jsx';
import { usePlayer } from '@/features/player/context/PlayerContext.jsx';
import { Link } from 'react-router-dom';
import { BookMarked, Heart, History, Plus } from 'lucide-react';

export default function Library() {
  const { user, isAuthenticated } = useAuth();
  const { playCard } = usePlayer();
  const [tab, setTab] = useState('playlists'); // 'playlists' | 'likes' | 'history'
  const [playlists, setPlaylists] = useState([]);
  const [likes, setLikes] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all([
      playlistsApi.getMyPlaylists().catch(() => []),
      likesApi.getLikes().catch(() => []),
      historyApi.getHistory().catch(() => [])
    ]).then(([pls, lks, hist]) => {
      setPlaylists(pls || []);
      setLikes((lks || []).map(s => toCard(s, 'song')));
      setHistory((hist || []).map(h => toCard(h.song || h, 'song')));
    }).finally(() => {
      setLoading(false);
    });
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="w-full h-full pt-28 pb-32 px-6 flex flex-col items-center justify-center text-center">
        <BookMarked className="w-12 h-12 text-ink-soft mb-3 opacity-60" />
        <h1 className="font-serif italic text-2xl text-ink">
          Your personal archive
        </h1>
        <p className="text-xs font-mono text-ink-soft max-w-sm mt-1 mb-6">
          Sign in to keep records, save playlists, and review your listening history.
        </p>
        <Link
          to="/login"
          className="px-6 py-2 bg-ink text-paper font-mono text-xs rounded-sm hover:bg-accent transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full h-full pt-20 pb-32 px-6 max-w-6xl mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-rule pb-4 mb-6 gap-4">
        <div>
          <h1 className="font-serif italic text-3xl text-ink">
            {user.displayName || user.username}'s Library
          </h1>
          <p className="text-xs font-mono text-ink-soft mt-1">
            Personal shelves, kept records, and listening trails.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setTab('playlists')}
            className={`px-3 py-1.5 rounded-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
              tab === 'playlists' ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink'
            }`}
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>Playlists ({playlists.length})</span>
          </button>
          <button
            onClick={() => setTab('likes')}
            className={`px-3 py-1.5 rounded-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
              tab === 'likes' ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Liked Songs ({likes.length})</span>
          </button>
          <button
            onClick={() => setTab('history')}
            className={`px-3 py-1.5 rounded-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
              tab === 'history' ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History</span>
          </button>
        </div>
      </div>

      {/* TAB CONTENT: PLAYLISTS */}
      {tab === 'playlists' && (
        <div>
          {playlists.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-serif italic text-lg text-ink-soft">
                Nothing kept yet. Go wander.
              </p>
              <p className="text-xs font-mono text-ink-faint mt-1">
                Drag cards onto the playlist dock to start your personal archive.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-6">
              {playlists.map((pl, idx) => {
                const card = toCard(pl, 'playlist');
                return (
                  <Card
                    key={card.id}
                    card={card}
                    tilt={(idx % 2 === 0 ? 1 : -1) * 2}
                    onClick={() => playCard(card)}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: LIKES */}
      {tab === 'likes' && (
        <div>
          {likes.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-serif italic text-lg text-ink-soft">
                No songs saved yet.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-6">
              {likes.map((song, idx) => (
                <Card
                  key={song.id}
                  card={song}
                  tilt={(idx % 2 === 0 ? -1.5 : 1.5)}
                  onClick={() => playCard(song, likes)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: HISTORY */}
      {tab === 'history' && (
        <div>
          {history.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-serif italic text-lg text-ink-soft">
                No records played yet in this session.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-6">
              {history.map((song, idx) => (
                <Card
                  key={`${song.id}-${idx}`}
                  card={song}
                  tilt={(idx % 2 === 0 ? 1 : -1) * 1.5}
                  onClick={() => playCard(song, history)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
