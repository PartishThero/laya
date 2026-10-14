// features/player/context/PlayerContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  useSyncExternalStore
} from 'react';
import { audioEngine } from '@/lib/audio/audioEngine.js';
import { useQueue } from '@/features/player/context/QueueContext.jsx';
import { useAuth } from '@/features/auth/context/AuthContext.jsx';
import { useToast } from '@/app/providers/ToastContext.jsx';
import { historyApi } from '@/services/api/history.api.js';
import { catalogueApi } from '@/services/api/catalogue.api.js';
import { playlistsApi } from '@/services/api/playlists.api.js';
import { toCard } from '@/models/card.model.js';

export const PlayerActionsContext = createContext(null);
export const PlayerStateContext = createContext(null);

export function PlayerProvider({ children }) {
  const { advanceNext, advancePrev, setContext, userQueue } = useQueue();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  // Attach toast handler to audio engine for BUG-07 notifications
  useEffect(() => {
    audioEngine.setToastHandler((msg, type) => {
      addToast(msg, type);
    });
  }, [addToast]);

  // Keep references fresh so actions remain completely stable (never change reference)
  const advanceNextRef = useRef(advanceNext);
  advanceNextRef.current = advanceNext;

  const advancePrevRef = useRef(advancePrev);
  advancePrevRef.current = advancePrev;

  const setContextRef = useRef(setContext);
  setContextRef.current = setContext;

  const userQueueRef = useRef(userQueue);
  userQueueRef.current = userQueue;

  const isAuthenticatedRef = useRef(isAuthenticated);
  isAuthenticatedRef.current = isAuthenticated;

  const playTrackDirect = useCallback((card) => {
    if (!card) return;
    audioEngine.load(card);

    if (isAuthenticatedRef.current && card.entityId && card.kind === 'song') {
      historyApi.recordHistory(card.entityId).catch(() => {});
    }
  }, []);

  const handleNext = useCallback(() => {
    const nextTrack = advanceNextRef.current();
    if (nextTrack) {
      playTrackDirect(nextTrack);
    }
  }, [playTrackDirect]);

  const handlePrev = useCallback(() => {
    if (audioEngine.currentTime > 3) {
      audioEngine.seek(0);
      return;
    }
    const current = audioEngine.getSnapshot().currentTrack;
    const prevTrack = advancePrevRef.current(current);
    if (prevTrack) {
      playTrackDirect(prevTrack);
    }
  }, [playTrackDirect]);

  // Set up OS mediaSession handlers
  useEffect(() => {
    audioEngine.setMediaSessionHandlers({
      onPlay: () => audioEngine.play().catch(() => {}),
      onPause: () => audioEngine.pause(),
      onNext: handleNext,
      onPrev: handlePrev,
      onSeek: (time) => audioEngine.seek(time)
    });
  }, [handleNext, handlePrev]);

  // Auto-advance next when audio ends
  useEffect(() => {
    const unsub = audioEngine.on('ended', () => {
      handleNext();
    });
    return unsub;
  }, [handleNext]);

  const playCard = useCallback(async (card, contextCards = []) => {
    if (!card) return;

    if (card.kind === 'song') {
      if (contextCards.length > 0) {
        const idx = contextCards.findIndex(c => c.id === card.id);
        setContextRef.current(contextCards, idx >= 0 ? idx : 0);
      }
      playTrackDirect(card);
    } else if (card.kind === 'album') {
      try {
        const fullAlbum = await catalogueApi.getAlbum(card.entityId);
        const albumTracks = (fullAlbum.tracks || []).map(t => toCard(t, 'song'));
        if (albumTracks.length > 0) {
          setContextRef.current(albumTracks, 0);
          playTrackDirect(albumTracks[0]);
        }
      } catch (err) {
        console.error('Failed to load album tracks:', err);
      }
    } else if (card.kind === 'playlist') {
      try {
        const fullPlaylist = await playlistsApi.getPlaylist(card.entityId);
        const playlistTracks = (fullPlaylist.songs || []).map(s => toCard(s, 'song'));
        if (playlistTracks.length > 0) {
          setContextRef.current(playlistTracks, 0);
          playTrackDirect(playlistTracks[0]);
        }
      } catch (err) {
        console.error('Failed to load playlist songs:', err);
      }
    }
  }, [playTrackDirect]);

  const pause = useCallback(() => {
    audioEngine.pause();
  }, []);

  const resume = useCallback(() => {
    audioEngine.play().catch(console.warn);
  }, []);

  const togglePlay = useCallback(() => {
    const snap = audioEngine.getSnapshot();
    if (!snap.currentTrack && userQueueRef.current.length > 0) {
      handleNext();
      return;
    }
    audioEngine.togglePlay();
  }, [handleNext]);

  const seek = useCallback((time) => {
    audioEngine.seek(time);
  }, []);

  const setVolume = useCallback((vol) => {
    audioEngine.setVolume(vol);
  }, []);

  const toggleMute = useCallback(() => {
    audioEngine.toggleMute();
  }, []);

  // Actions object is completely stable and will never trigger re-renders
  const actions = useMemo(() => ({
    playCard,
    playTrackDirect,
    pause,
    resume,
    togglePlay,
    seek,
    next: handleNext,
    previous: handlePrev,
    prev: handlePrev,
    setVolume,
    toggleMute
  }), [playCard, playTrackDirect, pause, resume, togglePlay, seek, handleNext, handlePrev, setVolume, toggleMute]);

  // State object subscribes to audio engine via useSyncExternalStore (currentTime excluded)
  const engineState = useSyncExternalStore(audioEngine.subscribe, audioEngine.getSnapshot);

  const playerState = useMemo(() => ({
    currentTrack: engineState.currentTrack,
    isPlaying: engineState.isPlaying,
    isPaused: engineState.isPaused,
    isBuffering: engineState.isBuffering,
    isLoading: engineState.isBuffering,
    duration: engineState.duration,
    volume: engineState.volume,
    isMuted: engineState.isMuted,
    error: engineState.error
  }), [engineState]);

  return (
    <PlayerActionsContext.Provider value={actions}>
      <PlayerStateContext.Provider value={playerState}>
        {children}
      </PlayerStateContext.Provider>
    </PlayerActionsContext.Provider>
  );
}

// Hook for stable actions (never causes re-renders)
export function usePlayerActions() {
  const ctx = useContext(PlayerActionsContext);
  if (!ctx) throw new Error('usePlayerActions must be used within PlayerProvider');
  return ctx;
}

// Hook for player state (updates only when track/status/volume/duration changes, NOT every time tick)
export function usePlayerState() {
  const ctx = useContext(PlayerStateContext);
  if (!ctx) throw new Error('usePlayerState must be used within PlayerProvider');
  return ctx;
}

// Hook for playback time (re-renders ONLY the component that calls this hook)
export function usePlaybackTime() {
  return useSyncExternalStore(audioEngine.subscribeTime, audioEngine.getTimeSnapshot);
}

// Backwards-compatible combined hook
export function usePlayer() {
  const actions = usePlayerActions();
  const state = usePlayerState();
  return useMemo(() => ({ ...state, ...actions }), [state, actions]);
}
