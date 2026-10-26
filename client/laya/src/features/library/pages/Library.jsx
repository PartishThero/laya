// pages/Library.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext.jsx';
import { playlistsApi } from '@/services/api/playlists.api.js';
import { likesApi } from '@/services/api/likes.api.js';
import { historyApi } from '@/services/api/history.api.js';
import { toCard } from '@/models/card.model.js';
import { Card } from '@/components/cards/Card.jsx';
import { usePlayer } from '@/features/player/context/PlayerContext.jsx';
import { Link } from 'react-router-dom';
import { BookMarked, Heart, History, FolderOpen, Music } from 'lucide-react';

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
      <div className="w-full h-full pt-28 pb-32 px-6 flex flex-col items-center justify-center text-center page-enter">
        <div className="w-16 h-16 rounded-2xl bg-paper-2 border border-rule/40 flex items-center justify-center mb-5">
          <BookMarked className="w-8 h-8 text-ink-faint opacity-50" />
        </div>
        <h1 className="font-serif italic text-3xl text-ink tracking-tight">
          Your personal archive
        </h1>
        <p className="text-xs font-mono text-ink-soft max-w-sm mt-2 mb-8 leading-relaxed">
          Sign in to keep records, save playlists, and review your listening history.
        </p>
        <Link to="/login" className="btn-primary">
          Sign In to Continue
        </Link>
      </div>
    );
  }

  const tabs = [
    { key: 'playlists', label: 'Playlists', count: playlists.length, icon: BookMarked },
    { key: 'likes', label: 'Liked Songs', count: likes.length, icon: Heart },
    { key: 'history', label: 'History', count: null, icon: History }
  ];

  return (
    <div className="w-full h-full pt-20 pb-32 px-6 max-w-6xl mx-auto overflow-y-auto">
      {/* Header */}
      <div className="page-enter pb-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="accent-line mb-4" />
            <h1 className="font-serif italic text-3xl md:text-4xl text-ink tracking-tight">
              {user.displayName || user.username}'s Library
            </h1>
            <p className="text-xs font-mono text-ink-faint mt-1.5">
              Personal shelves, kept records, and listening trails.
            </p>
          </div>

          {/* Tab switchers */}
          <div className="flex items-center gap-1 p-1 bg-paper-2/60 rounded-lg border border-rule/30">
            {tabs.map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`px-3.5 py-2 rounded-md transition-all duration-200 cursor-pointer flex items-center gap-1.5 text-[11px] font-mono ${
                    tab === t.key
                      ? 'bg-ink text-paper shadow-sm'
                      : 'text-ink-soft hover:text-ink hover:bg-paper/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                  {t.count !== null && (
                    <span className={`text-[9px] ${tab === t.key ? 'text-paper/70' : 'text-ink-faint'}`}>
                      {t.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* TAB CONTENT: PLAYLISTS */}
      {tab === 'playlists' && (
        <div className="page-enter-delayed">
          {playlists.length === 0 ? (
            <div className="empty-state">
              <FolderOpen className="empty-state-icon" />
              <p className="font-serif italic text-lg text-ink-soft">
                Nothing kept yet. Go wander.
              </p>
              <p className="text-xs font-mono text-ink-faint mt-1.5 max-w-xs">
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
                    tilt={0}
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
        <div className="page-enter-delayed">
          {likes.length === 0 ? (
            <div className="empty-state">
              <Heart className="empty-state-icon" />
              <p className="font-serif italic text-lg text-ink-soft">
                No songs saved yet.
              </p>
              <p className="text-xs font-mono text-ink-faint mt-1.5">
                Like songs while listening to save them here.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-6">
              {likes.map((song, idx) => (
                <Card
                  key={song.id}
                  card={song}
                  tilt={0}
                  onClick={() => playCard(song, likes)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: HISTORY */}
      {tab === 'history' && (
        <div className="page-enter-delayed">
          {history.length === 0 ? (
            <div className="empty-state">
              <History className="empty-state-icon" />
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
                  tilt={0}
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
