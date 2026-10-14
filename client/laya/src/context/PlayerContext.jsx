// context/PlayerContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { audioEngine } from '@/lib/audio/audioEngine.js';
import { useQueue } from './QueueContext.jsx';
import { useAuth } from './AuthContext.jsx';
import { historyApi } from '../services/api/history.api.js';
import { catalogueApi } from '../services/api/catalogue.api.js';
import { playlistsApi } from '../services/api/playlists.api.js';
import { toCard } from '../models/card.model.js';

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const { advanceNext, advancePrev, setContext, queueCard, userQueue } = useQueue();
  const { isAuthenticated } = useAuth();

  const [currentTrack, setCurrentTrack] = useState(null);
  const [engineState, setEngineState] = useState(audioEngine.state);

  // Subscribe to audio engine events
  useEffect(() => {
    const unsubscribe = audioEngine.subscribe((event, payload, state) => {
      setEngineState({ ...state });

      if (event === 'ended') {
        // Auto-advance next
        handleNext();
      }
    });

    return unsubscribe;
  }, []);

  const handleNext = useCallback(() => {
    const nextTrack = advanceNext();
    if (nextTrack) {
      playTrackDirect(nextTrack);
    }
  }, [advanceNext]);

  const handlePrev = useCallback(() => {
    // If playing for more than 3s, seek to 0 first
    if (engineState.currentTime > 3) {
      audioEngine.seek(0);
      return;
    }
    const prevTrack = advancePrev(currentTrack);
    if (prevTrack) {
      playTrackDirect(prevTrack);
    }
  }, [advancePrev, currentTrack, engineState.currentTime]);

  const playTrackDirect = useCallback((card) => {
    if (!card) return;
    setCurrentTrack(card);
    audioEngine.load(card);

    // Record listening history if authenticated
    if (isAuthenticated && card.entityId && card.kind === 'song') {
      historyApi.recordHistory(card.entityId).catch(() => {});
    }
  }, [isAuthenticated]);

  const playCard = useCallback(async (card, contextCards = []) => {
    if (!card) return;

    if (card.kind === 'song') {
      if (contextCards.length > 0) {
        const idx = contextCards.findIndex(c => c.id === card.id);
        setContext(contextCards, idx >= 0 ? idx : 0);
      }
      playTrackDirect(card);
    } else if (card.kind === 'album') {
      try {
        const fullAlbum = await catalogueApi.getAlbum(card.entityId);
        const albumTracks = (fullAlbum.tracks || []).map(t => toCard(t, 'song'));
        if (albumTracks.length > 0) {
          setContext(albumTracks, 0);
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
          setContext(playlistTracks, 0);
          playTrackDirect(playlistTracks[0]);
        }
      } catch (err) {
        console.error('Failed to load playlist songs:', err);
      }
    }
  }, [setContext, playTrackDirect]);

  const togglePlay = useCallback(() => {
    if (!currentTrack && userQueue.length > 0) {
      handleNext();
      return;
    }
    audioEngine.togglePlay();
  }, [currentTrack, userQueue, handleNext]);

  const seek = useCallback((time) => {
    audioEngine.seek(time);
  }, []);

  const setVolume = useCallback((vol) => {
    audioEngine.setVolume(vol);
  }, []);

  const toggleMute = useCallback(() => {
    audioEngine.toggleMute();
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying: engineState.isPlaying,
        currentTime: engineState.currentTime,
        duration: engineState.duration,
        volume: engineState.volume,
        isMuted: engineState.isMuted,
        isLoading: engineState.isLoading,
        error: engineState.error,
        playCard,
        playTrackDirect,
        togglePlay,
        next: handleNext,
        prev: handlePrev,
        seek,
        setVolume,
        toggleMute
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
