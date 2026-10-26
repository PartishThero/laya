// pages/Playlist.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { playlistsApi } from '@/services/api/playlists.api.js';
import { toCard } from '@/models/card.model.js';
import { usePlayer } from '@/features/player/context/PlayerContext.jsx';
import { useQueue } from '@/features/player/context/QueueContext.jsx';
import { useToast } from '@/app/providers/ToastContext.jsx';
import { useAuth } from '@/features/auth/context/AuthContext.jsx';
import { CardArt } from '@/components/cards/CardArt.jsx';
import { formatTime } from '@/lib/time.js';
import { Play, ArrowLeft, Trash2, Edit2, Loader2, ArrowUp, ArrowDown, FolderOpen, Music, Clock } from 'lucide-react';

export default function Playlist() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');

  const { playTrackDirect, setContext } = usePlayer();
  const { queueCard } = useQueue();
  const { addToast } = useToast();
  const { user } = useAuth();

  const loadData = () => {
    playlistsApi.getPlaylist(id)
      .then(res => {
        setPlaylist(res);
        setEditName(res.name);
      })
      .catch(err => setError(err.message || 'Playlist not found'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="w-full h-full pt-32 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
        <span className="text-xs font-mono text-ink-faint">Loading playlist…</span>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="w-full h-full pt-32 flex flex-col items-center justify-center gap-2">
        <FolderOpen className="w-10 h-10 text-ink-faint opacity-40" />
        <p className="font-serif italic text-lg text-ink-soft">Playlist not found.</p>
        <Link to="/playlists" className="font-mono text-xs text-accent hover:underline mt-2">
          Return to Playlists
        </Link>
      </div>
    );
  }

  const isOwner = user && playlist.owner && (
    (playlist.owner._id || playlist.owner) === user.id ||
    (playlist.owner._id || playlist.owner) === user._id
  );

  const playlistCard = toCard(playlist, 'playlist');
  const songCards = (playlist.songs || []).map(s => toCard(s, 'song'));
  const totalDuration = songCards.reduce((sum, t) => sum + (t.meta?.duration || 0), 0);

  const handlePlayAll = () => {
    if (songCards.length > 0) {
      setContext(songCards, 0);
      playTrackDirect(songCards[0]);
    }
  };

  const handleRename = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return;
    try {
      await playlistsApi.updatePlaylist(id, { name: editName.trim() });
      addToast('Playlist renamed', 'success');
      setIsEditing(false);
      loadData();
    } catch (err) {
      addToast('Failed to rename playlist', 'error');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete playlist "${playlist.name}"?`)) return;
    try {
      await playlistsApi.deletePlaylist(id);
      addToast('Playlist removed', 'info');
      navigate('/library');
    } catch (err) {
      addToast('Failed to delete playlist', 'error');
    }
  };

  const handleRemoveTrack = async (songId) => {
    try {
      await playlistsApi.removeSong(id, songId);
      addToast('Track removed', 'info');
      loadData();
    } catch (err) {
      addToast('Failed to remove track', 'error');
    }
  };

  const handleMoveTrack = async (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= songCards.length) return;
    const currentSongIds = songCards.map(s => s.entityId);
    const [moved] = currentSongIds.splice(fromIdx, 1);
    currentSongIds.splice(toIdx, 0, moved);

    try {
      await playlistsApi.reorderSongs(id, currentSongIds);
      loadData();
    } catch (err) {
      addToast('Failed to reorder tracks', 'error');
    }
  };

  return (
    <div className="w-full h-full pt-20 pb-32 px-6 max-w-4xl mx-auto overflow-y-auto">
      {/* Back link */}
      <div className="page-enter">
        <Link
          to="/playlists"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-faint hover:text-ink transition-colors duration-200 mb-8 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>All Playlists</span>
        </Link>
      </div>

      {/* Playlist Hero */}
      <div className="page-enter flex flex-col md:flex-row gap-8 items-start pb-8 mb-10">
        <div className="w-48 h-48 rounded-lg overflow-hidden shrink-0 shadow-xl ring-1 ring-rule/20">
          <CardArt card={playlistCard} className="w-full h-full" />
        </div>

        <div className="flex-1 page-enter-delayed">
          <span className="stat-badge mb-3">
            PLAYLIST FOLDER
          </span>

          {isEditing ? (
            <form onSubmit={handleRename} className="flex gap-2 items-center mt-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="input-premium !text-2xl font-serif font-bold !py-1.5"
                autoFocus
              />
              <button type="submit" className="btn-primary !py-1.5 !px-3">Save</button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-xs font-mono text-ink-soft px-2 py-1 hover:text-ink cursor-pointer"
              >
                Cancel
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-3 mt-2">
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-ink tracking-tight">
                {playlist.name}
              </h1>
              {isOwner && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 text-ink-faint hover:text-accent hover:bg-accent-soft rounded-md cursor-pointer transition-all duration-200"
                  title="Rename playlist"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          <p className="font-sans text-sm text-ink-soft mt-2">
            Curated by <span className="font-medium text-ink">{playlist.owner?.displayName || playlist.owner?.username || 'Archivist'}</span>
          </p>

          <p className="font-serif italic text-sm text-ink-soft mt-3 max-w-lg leading-relaxed">
            {playlist.description || 'A hand-selected shelf preserved in the collection.'}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-3 mt-4">
            <span className="stat-badge">
              <Music className="w-3 h-3" />
              {songCards.length} {songCards.length === 1 ? 'record' : 'records'}
            </span>
            {totalDuration > 0 && (
              <span className="stat-badge">
                <Clock className="w-3 h-3" />
                {formatTime(totalDuration)}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={handlePlayAll}
              disabled={songCards.length === 0}
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:bg-ink"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play Playlist</span>
            </button>

            {isOwner && (
              <button
                onClick={handleDelete}
                className="btn-secondary !border-rule hover:!border-danger hover:!text-danger"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Accent divider */}
      <div className="accent-line mb-8" />

      {/* Tracks */}
      <div className="page-enter-delayed stagger-2">
        <h2 className="section-header font-serif text-lg font-medium text-ink mb-5">
          Recorded Tracks ({songCards.length})
        </h2>

        {songCards.length === 0 ? (
          <div className="empty-state border border-dashed border-rule/40 rounded-lg">
            <FolderOpen className="empty-state-icon" />
            <p className="font-serif italic text-ink-soft">
              This playlist is currently empty.
            </p>
            <p className="text-xs font-mono text-ink-faint mt-1.5 max-w-xs">
              Drag cards from the canvas directly onto this playlist dock to add them.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-rule/40 overflow-hidden bg-paper-2/30">
            {songCards.map((track, idx) => (
              <div
                key={track.id || idx}
                className={`track-row group ${idx < songCards.length - 1 ? 'border-b border-rule/20' : ''}`}
                style={{ margin: 0, borderRadius: 0 }}
              >
                <div
                  className="flex items-center gap-4 flex-1 cursor-pointer overflow-hidden"
                  onClick={() => {
                    setContext(songCards, idx);
                    playTrackDirect(track);
                  }}
                >
                  <span className="font-mono text-xs text-ink-faint w-6 text-right tabular-nums">
                    {idx + 1}
                  </span>
                  <div className="w-9 h-9 rounded-md overflow-hidden shrink-0 border border-rule/20 shadow-sm">
                    <CardArt card={track} className="w-full h-full" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-serif text-sm font-medium text-ink truncate group-hover:text-accent transition-colors">
                      {track.title}
                    </p>
                    <p className="font-sans text-xs text-ink-faint truncate">
                      {track.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pl-4">
                  {track.meta?.duration > 0 && (
                    <span className="font-mono text-xs text-ink-faint tabular-nums">
                      {formatTime(track.meta.duration)}
                    </span>
                  )}

                  {/* Reorder up/down for owner */}
                  {isOwner && (
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => handleMoveTrack(idx, idx - 1)}
                        disabled={idx === 0}
                        className="p-1 text-ink-faint hover:text-ink disabled:opacity-20 cursor-pointer rounded-md hover:bg-paper-2"
                        title="Move track up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveTrack(idx, idx + 1)}
                        disabled={idx === songCards.length - 1}
                        className="p-1 text-ink-faint hover:text-ink disabled:opacity-20 cursor-pointer rounded-md hover:bg-paper-2"
                        title="Move track down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {isOwner && (
                    <button
                      onClick={() => handleRemoveTrack(track.entityId)}
                      className="p-1 text-ink-faint hover:text-danger cursor-pointer rounded-md hover:bg-danger/10 opacity-0 group-hover:opacity-100 transition-all duration-200"
                      title="Remove from playlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
