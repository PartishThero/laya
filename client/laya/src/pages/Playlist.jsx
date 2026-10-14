// pages/Playlist.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { playlistsApi } from '../services/api/playlists.api.js';
import { toCard } from '../models/card.model.js';
import { usePlayer } from '../context/PlayerContext.jsx';
import { useQueue } from '../context/QueueContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { CardArt } from '../components/cards/CardArt.jsx';
import { formatDuration } from '../utils/format.js';
import { Play, ArrowLeft, Trash2, Edit2, Loader2, ArrowUp, ArrowDown } from 'lucide-react';

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
      <div className="w-full h-full pt-32 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="w-full h-full pt-32 text-center">
        <p className="font-serif italic text-lg text-ink-soft">Playlist not found.</p>
        <Link to="/playlists" className="font-mono text-xs text-accent mt-2 inline-block">
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
      <Link
        to="/playlists"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-soft hover:text-ink mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>All Playlists</span>
      </Link>

      <div className="flex flex-col md:flex-row gap-8 items-start border-b border-rule pb-8 mb-8">
        <div className="w-48 h-48 rounded-sm overflow-hidden border border-rule shadow-xl shrink-0">
          <CardArt card={playlistCard} className="w-full h-full" />
        </div>

        <div className="flex-1">
          <span className="text-[10px] font-mono tracking-widest uppercase text-ink-soft bg-paper-2 px-2 py-0.5 rounded-xs border border-rule/50">
            PLAYLIST FOLDER
          </span>

          {isEditing ? (
            <form onSubmit={handleRename} className="flex gap-2 items-center mt-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="font-serif text-2xl font-bold px-2 py-1 bg-paper-2 border border-accent rounded-xs outline-none"
                autoFocus
              />
              <button
                type="submit"
                className="text-xs font-mono px-3 py-1.5 bg-ink text-paper rounded-xs"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-xs font-mono text-ink-soft px-2 py-1"
              >
                Cancel
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-3 mt-2">
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-ink">
                {playlist.name}
              </h1>
              {isOwner && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 text-ink-soft hover:text-accent cursor-pointer"
                  title="Rename playlist"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          <p className="font-sans text-sm text-ink-soft mt-1">
            Curated by <span className="font-medium text-ink">{playlist.owner?.displayName || playlist.owner?.username || 'Archivist'}</span>
            {` · ${songCards.length} ${songCards.length === 1 ? 'record' : 'records'}`}
          </p>

          <p className="font-serif italic text-sm text-ink-soft mt-3 max-w-lg">
            {playlist.description || 'A hand-selected shelf preserved in the collection.'}
          </p>

          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={handlePlayAll}
              disabled={songCards.length === 0}
              className="px-4 py-2 bg-ink text-paper rounded-xs font-mono text-xs hover:bg-accent transition-colors flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-40"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play Playlist</span>
            </button>

            {isOwner && (
              <button
                onClick={handleDelete}
                className="px-3 py-2 bg-paper-2 border border-rule hover:border-danger hover:text-danger rounded-xs font-mono text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tracks */}
      <div>
        <h2 className="font-serif text-lg font-medium text-ink mb-4">
          Recorded Tracks ({songCards.length})
        </h2>

        {songCards.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-rule/60 rounded-xs">
            <p className="font-serif italic text-ink-soft">
              This playlist is currently empty.
            </p>
            <p className="text-xs font-mono text-ink-faint mt-1">
              Drag cards from the canvas directly onto this playlist dock to add them.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-rule/40 border border-rule/50 rounded-xs bg-paper-2/40">
            {songCards.map((track, idx) => (
              <div
                key={track.id || idx}
                className="flex items-center justify-between p-3 hover:bg-paper-2 transition-colors group"
              >
                <div
                  className="flex items-center gap-4 flex-1 cursor-pointer overflow-hidden"
                  onClick={() => {
                    setContext(songCards, idx);
                    playTrackDirect(track);
                  }}
                >
                  <span className="font-mono text-xs text-ink-faint w-5 text-right">
                    {idx + 1}
                  </span>
                  <div className="w-8 h-8 rounded-xs overflow-hidden shrink-0 border border-rule/30">
                    <CardArt card={track} className="w-full h-full" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-serif text-sm font-medium text-ink truncate group-hover:text-accent">
                      {track.title}
                    </p>
                    <p className="font-sans text-xs text-ink-soft truncate">
                      {track.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pl-4">
                  {track.meta?.duration > 0 && (
                    <span className="font-mono text-xs text-ink-faint">
                      {formatDuration(track.meta.duration)}
                    </span>
                  )}

                  {/* Reorder up/down for owner */}
                  {isOwner && (
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => handleMoveTrack(idx, idx - 1)}
                        disabled={idx === 0}
                        className="p-1 text-ink-soft hover:text-ink disabled:opacity-20 cursor-pointer"
                        title="Move track up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveTrack(idx, idx + 1)}
                        disabled={idx === songCards.length - 1}
                        className="p-1 text-ink-soft hover:text-ink disabled:opacity-20 cursor-pointer"
                        title="Move track down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {isOwner && (
                    <button
                      onClick={() => handleRemoveTrack(track.entityId)}
                      className="p-1 text-ink-soft hover:text-danger cursor-pointer ml-1"
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
