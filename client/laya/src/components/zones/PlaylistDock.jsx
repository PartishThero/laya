// components/zones/PlaylistDock.jsx
import React, { useState, useEffect } from 'react';
import { usePrefs } from '../../context/PrefsContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useDropZone } from '../../hooks/useDropZone.js';
import { playlistsApi } from '../../services/api/playlists.api.js';
import { CardArt } from '../cards/CardArt.jsx';
import { ZoneStamp } from './ZoneStamp.jsx';
import { Plus, Lock, FolderPlus } from 'lucide-react';
import { toCard } from '../../models/card.model.js';

function DockPlaylistSlot({ playlist, onRefresh }) {
  const [stamp, setStamp] = useState('idle');

  const { zoneRef, isOver, isNear } = useDropZone({
    id: `playlist-dock-${playlist._id || playlist.id}`,
    type: 'playlist',
    payload: {
      playlistId: playlist._id || playlist.id,
      playlistName: playlist.name,
      onSuccess: () => {
        setStamp('confirmed');
        if (onRefresh) onRefresh();
        setTimeout(() => setStamp('idle'), 2500);
      }
    }
  });

  const cardModel = toCard(playlist, 'playlist');

  return (
    <div
      ref={zoneRef}
      className={`relative w-28 p-2 rounded-xs border transition-all duration-200 select-none flex flex-col items-center text-center cursor-pointer ${
        isOver
          ? 'bg-paper border-accent shadow-md scale-105'
          : isNear
          ? 'border-accent/60 bg-paper-2'
          : 'bg-paper-2/70 border-rule/50 hover:bg-paper-2'
      }`}
      title={`Playlist: ${playlist.name}. Drop songs or albums here to add.`}
    >
      <div className="w-12 h-12 rounded-xs overflow-hidden border border-rule/40 mb-1.5 shadow-2xs">
        <CardArt card={cardModel} className="w-full h-full" />
      </div>

      <p className="font-serif text-[11px] font-medium text-ink truncate w-full leading-tight">
        {playlist.name}
      </p>
      <span className="text-[9px] font-mono text-ink-soft">
        {playlist.songs?.length || 0} trk
      </span>

      {stamp !== 'idle' && (
        <div className="absolute inset-0 bg-paper/90 backdrop-blur-2xs flex items-center justify-center p-1 rounded-xs">
          <ZoneStamp status={stamp} />
        </div>
      )}
    </div>
  );
}

export function PlaylistDock() {
  const { dockOpen, toggleDock } = usePrefs();
  const { isAuthenticated } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const loadPlaylists = () => {
    if (isAuthenticated) {
      playlistsApi.getMyPlaylists()
        .then(setPlaylists)
        .catch(() => {});
    } else {
      playlistsApi.getPublicPlaylists()
        .then(setPlaylists)
        .catch(() => {});
    }
  };

  useEffect(() => {
    loadPlaylists();
  }, [isAuthenticated]);

  const handleCreateNew = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      await playlistsApi.createPlaylist({ name: newTitle.trim(), isPublic: true });
      setNewTitle('');
      setCreating(false);
      loadPlaylists();
    } catch (err) {
      console.error('Failed to create playlist:', err);
    }
  };

  if (!dockOpen) {
    return (
      <div className="fixed top-16 right-4 z-[300]">
        <button
          onClick={toggleDock}
          className="px-2.5 py-1 text-xs font-mono bg-paper/90 border border-rule hover:border-accent text-ink rounded-sm shadow-sm transition-colors cursor-pointer select-none flex items-center gap-1.5"
          title="Open Playlist Dock (Key: P)"
        >
          <FolderPlus className="w-3.5 h-3.5 text-ink-soft" />
          <span>Playlists</span>
          <kbd className="text-[9px] text-ink-faint px-1 bg-paper-2 rounded-xs">P</kbd>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed top-16 right-4 z-[300] bg-paper/95 backdrop-blur-md border border-rule rounded-sm shadow-xl p-3 flex flex-col gap-2 max-w-xs select-none animate-in fade-in slide-in-from-right-4 duration-200">
      <div className="flex items-center justify-between border-b border-rule/50 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="font-serif text-xs font-medium text-ink">Playlist Dock</span>
          {!isAuthenticated && (
            <span className="inline-flex items-center gap-0.5 text-[9px] font-mono text-ink-soft bg-paper-2 px-1 rounded-xs">
              <Lock className="w-2.5 h-2.5" /> read-only
            </span>
          )}
        </div>
        <button
          onClick={toggleDock}
          className="text-xs font-mono text-ink-soft hover:text-ink cursor-pointer px-1"
          title="Hide Dock (P)"
        >
          ✕
        </button>
      </div>

      {/* Playlist items carousel / rail */}
      <div className="flex gap-2 overflow-x-auto py-1 max-w-[280px]">
        {playlists.map(p => (
          <DockPlaylistSlot
            key={p._id || p.id}
            playlist={p}
            onRefresh={loadPlaylists}
          />
        ))}

        {/* New Playlist slot */}
        {isAuthenticated && (
          <div
            onClick={() => setCreating(true)}
            className="w-24 shrink-0 p-2 rounded-xs border border-dashed border-rule/80 hover:border-accent/80 hover:bg-paper-2 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
          >
            <Plus className="w-5 h-5 text-ink-soft mb-1" />
            <span className="text-[10px] font-mono text-ink-soft leading-tight">
              New Shelf
            </span>
          </div>
        )}
      </div>

      {creating && (
        <form onSubmit={handleCreateNew} className="pt-2 border-t border-rule/50 flex gap-1.5">
          <input
            type="text"
            placeholder="Playlist name..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            autoFocus
            className="flex-1 text-xs px-2 py-1 bg-paper-2 border border-rule rounded-xs outline-none focus:border-accent font-serif"
          />
          <button
            type="submit"
            className="text-xs font-mono px-2 py-1 bg-ink text-paper rounded-xs hover:bg-accent cursor-pointer"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setCreating(false)}
            className="text-xs font-mono px-1.5 py-1 text-ink-soft cursor-pointer"
          >
            Cancel
          </button>
        </form>
      )}

      <div className="text-[9px] font-mono text-ink-faint flex justify-between">
        <span>Drop cards onto any slot</span>
        <span>Press P to toggle</span>
      </div>
    </div>
  );
}
