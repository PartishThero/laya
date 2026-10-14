// context/DragContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { dragController, DRAG_STATES } from '@/lib/dnd/dragController.js';
import { hitTester } from '@/lib/dnd/hitTest.js';
import { useQueue } from '@/features/player/context/QueueContext.jsx';
import { usePlayer } from '@/features/player/context/PlayerContext.jsx';
import { useToast } from '@/app/providers/ToastContext.jsx';
import { useAuth } from '@/features/auth/context/AuthContext.jsx';
import { playlistsApi } from '@/services/api/playlists.api.js';
import { catalogueApi } from '@/services/api/catalogue.api.js';
import { toCard } from '@/models/card.model.js';

const DragContext = createContext(null);

export function DragProvider({ children }) {
  const [dragState, setDragState] = useState(dragController.state);
  const { queueCard } = useQueue();
  const { playTrackDirect, currentTrack } = usePlayer();
  const { addToast } = useToast();
  const { isAuthenticated } = useAuth();
  const canvasDropHandlerRef = useRef(null);

  const registerCanvasDropHandler = useCallback((handler) => {
    canvasDropHandlerRef.current = handler;
    return () => {
      canvasDropHandlerRef.current = null;
    };
  }, []);

  useEffect(() => {
    return dragController.subscribe(setDragState);
  }, []);

  const handleDrop = useCallback(async () => {
    const { card, origin, current, target, status } = dragController.state;
    if (status === DRAG_STATES.IDLE || !card) return;

    if (!target) {
      // If dropped on the spatial canvas, allow the canvas to place it
      if (canvasDropHandlerRef.current && current && origin) {
        const handled = canvasDropHandlerRef.current({ card, origin, current });
        if (handled) {
          dragController.reset();
          return;
        }
      }

      // Dropped on empty space outside canvas or unhandled -> cancel
      dragController.cancel();
      return;
    }

    // TARGET 1: Now Playing zone -> add to queue
    if (target.type === 'now-playing') {
      if (card.kind === 'song') {
        if (!currentTrack) {
          playTrackDirect(card);
        } else {
          queueCard(card);
          addToast(`Queued "${card.title}"`, 'info');
        }
      } else if (card.kind === 'album') {
        try {
          const alb = await catalogueApi.getAlbum(card.entityId);
          const tracks = (alb.tracks || []).map(t => toCard(t, 'song'));
          if (tracks.length > 0) {
            if (!currentTrack) {
              playTrackDirect(tracks[0]);
              queueCard(tracks.slice(1));
            } else {
              queueCard(tracks);
            }
            addToast(`Queued ${tracks.length} tracks from "${card.title}"`, 'info');
          }
        } catch (err) {
          addToast('Failed to queue album tracks', 'error');
        }
      } else if (card.kind === 'playlist') {
        try {
          const pl = await playlistsApi.getPlaylist(card.entityId);
          const tracks = (pl.songs || []).map(s => toCard(s, 'song'));
          if (tracks.length > 0) {
            if (!currentTrack) {
              playTrackDirect(tracks[0]);
              queueCard(tracks.slice(1));
            } else {
              queueCard(tracks);
            }
            addToast(`Queued ${tracks.length} tracks from playlist`, 'info');
          }
        } catch (err) {
          addToast('Failed to queue playlist tracks', 'error');
        }
      }

      dragController.confirm();
      return;
    }

    // TARGET 2: Playlist zone (dock card, roaming tray, or new-playlist)
    if (target.type === 'playlist') {
      if (!isAuthenticated) {
        dragController.fail('Sign in to add music to playlists');
        addToast('Sign in to save music to playlists', 'error');
        return;
      }

      dragController.dropPending(target);

      try {
        const playlistId = target.playlistId;
        const songIds = [];

        if (card.kind === 'song') {
          songIds.push(card.entityId);
        } else if (card.kind === 'album') {
          const alb = await catalogueApi.getAlbum(card.entityId);
          songIds.push(...(alb.tracks || []).map(t => t._id || t.id));
        }

        if (songIds.length === 0) {
          dragController.fail('No tracks found to add');
          return;
        }

        // Add tracks to playlist on server
        for (const sid of songIds) {
          await playlistsApi.addSong(playlistId, sid);
        }

        dragController.confirm();
        addToast(
          card.kind === 'album'
            ? `Added ${songIds.length} tracks to "${target.playlistName || 'playlist'}"`
            : `Added "${card.title}" to "${target.playlistName || 'playlist'}"`,
          'success'
        );

        if (target.onSuccess) {
          target.onSuccess();
        }
      } catch (err) {
        dragController.fail(err.message || 'Failed to add to playlist');
        addToast(`Failed to add: ${err.message || 'Server error'}`, 'error');
      }
      return;
    }

    // Unknown target
    dragController.cancel();
  }, [queueCard, playTrackDirect, currentTrack, addToast, isAuthenticated]);

  return (
    <DragContext.Provider value={{ dragState, handleDrop, hitTester, registerCanvasDropHandler }}>
      {children}
    </DragContext.Provider>
  );
}

export function useDrag() {
  const ctx = useContext(DragContext);
  if (!ctx) throw new Error('useDrag must be used within DragProvider');
  return ctx;
}
