// lib/audio/audioEngine.js
// Audio engine external store outside the React component tree

import {
  updateMediaSession,
  updateMediaSessionPlaybackState,
  updateMediaSessionPositionState
} from './mediaSession.js';

class AudioEngine {
  constructor() {
    this.audio = typeof Audio !== 'undefined' ? new Audio() : null;
    if (this.audio) {
      this.audio.preload = 'metadata';
    }

    this.listeners = new Set();
    this.timeListeners = new Set();
    this.eventListeners = new Map(); // event -> Set(callbacks)

    this.currentTime = 0;
    this.state = {
      currentTrack: null,
      isPlaying: false,
      isPaused: false,
      isBuffering: false,
      duration: 0,
      volume: 0.8,
      isMuted: false,
      error: null
    };

    if (this.audio) {
      this.audio.volume = this.state.volume;
    }

    this.playId = 0;
    this.retryCount = 0;
    this.maxRetries = 2;
    this.retryTimer = null;
    this.toastHandler = null;
    this.mediaHandlers = {};

    this._bindEvents();
  }

  _bindEvents() {
    if (!this.audio) return;

    this.audio.addEventListener('play', () => {
      this._updateState({ isPlaying: true, isPaused: false, isBuffering: false, error: null });
      updateMediaSessionPlaybackState('playing');
    });

    this.audio.addEventListener('pause', () => {
      // If we didn't end or change tracks, mark paused
      if (this.state.currentTrack) {
        this._updateState({ isPlaying: false, isPaused: true, isBuffering: false });
        updateMediaSessionPlaybackState('paused');
      }
    });

    this.audio.addEventListener('timeupdate', () => {
      this.currentTime = this.audio.currentTime || 0;
      this._emitTime();
      updateMediaSessionPositionState({
        duration: this.state.duration,
        position: this.currentTime
      });
    });

    this.audio.addEventListener('loadedmetadata', () => {
      const dur = this.audio.duration || this.state.currentTrack?.meta?.duration || 0;
      this._updateState({
        duration: dur,
        isBuffering: false
      });
      updateMediaSessionPositionState({
        duration: dur,
        position: this.currentTime
      });
    });

    this.audio.addEventListener('waiting', () => {
      this._updateState({ isBuffering: true });
    });

    this.audio.addEventListener('playing', () => {
      this.retryCount = 0;
      this._updateState({ isBuffering: false, isPlaying: true, isPaused: false });
      updateMediaSessionPlaybackState('playing');
    });

    this.audio.addEventListener('ended', () => {
      this.currentTime = 0;
      this._emitTime();
      this._updateState({ isPlaying: false, isPaused: false, isBuffering: false });
      updateMediaSessionPlaybackState('paused');
      this._emit('ended');
    });

    this.audio.addEventListener('error', () => {
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        this._updateState({ isBuffering: true, error: null });
        clearTimeout(this.retryTimer);
        this.retryTimer = setTimeout(() => {
          if (this.state.currentTrack && this.audio) {
            this.audio.load();
            this.play().catch(() => {});
          }
        }, 800);
      } else {
        const err = this.audio.error;
        const msg = err ? `Audio playback error (${err.code})` : 'Failed to load audio stream';
        this._updateState({ isPlaying: false, isPaused: false, isBuffering: false, error: msg });
        updateMediaSessionPlaybackState('none');
        this._emit('error', msg);

        if (this.toastHandler) {
          const trackTitle = this.state.currentTrack?.title || 'track';
          this.toastHandler(`Stream error: unable to play "${trackTitle}" after 2 retries.`, 'error');
        }
      }
    });
  }

  _updateState(partial) {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach(listener => {
      try {
        listener();
      } catch (e) {
        console.error('AudioEngine state listener error:', e);
      }
    });
  }

  _emitTime() {
    this.timeListeners.forEach(listener => {
      try {
        listener();
      } catch (e) {
        console.error('AudioEngine time listener error:', e);
      }
    });
  }

  _emit(eventName, payload) {
    const cbs = this.eventListeners.get(eventName);
    if (cbs) {
      cbs.forEach(cb => {
        try {
          cb(payload);
        } catch (e) {
          console.error(`AudioEngine ${eventName} event error:`, e);
        }
      });
    }
  }

  on(eventName, callback) {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, new Set());
    }
    this.eventListeners.get(eventName).add(callback);
    return () => {
      this.eventListeners.get(eventName)?.delete(callback);
    };
  }

  // External store interface for React useSyncExternalStore
  subscribe = (listener) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = () => {
    return this.state;
  };

  // Separate external store interface for currentTime
  subscribeTime = (listener) => {
    this.timeListeners.add(listener);
    return () => {
      this.timeListeners.delete(listener);
    };
  };

  getTimeSnapshot = () => {
    return this.currentTime;
  };

  setToastHandler(handler) {
    this.toastHandler = handler;
  }

  setMediaSessionHandlers(handlers) {
    this.mediaHandlers = { ...this.mediaHandlers, ...handlers };
    if (this.state.currentTrack) {
      updateMediaSession(this.state.currentTrack, this.mediaHandlers);
    }
  }

  async load(track) {
    if (!track || !this.audio) return;
    const currentPlayId = ++this.playId;
    clearTimeout(this.retryTimer);
    this.retryCount = 0;

    // Reset playback
    try {
      this.audio.pause();
    } catch {
      // Ignore pause errors
    }

    this.currentTime = 0;
    this._emitTime();

    const trackDuration = track.meta?.duration || 0;
    this._updateState({
      currentTrack: track,
      duration: trackDuration,
      isPlaying: false,
      isPaused: false,
      isBuffering: true,
      error: null
    });

    updateMediaSession(track, this.mediaHandlers);
    updateMediaSessionPlaybackState('playing');

    if (track.audioUrl) {
      this.audio.src = track.audioUrl;
      this.audio.load();

      try {
        const promise = this.audio.play();
        if (promise !== undefined) {
          await promise;
        }
      } catch (err) {
        // BUG-04: Ignore AbortError and stale promises when track was switched
        if (currentPlayId !== this.playId || err.name === 'AbortError') {
          return;
        }
        console.warn('Autoplay prevented or failed:', err);
      }
    }
  }

  async play() {
    if (!this.audio || !this.audio.src) return;
    const currentPlayId = ++this.playId;
    try {
      const promise = this.audio.play();
      if (promise !== undefined) {
        await promise;
      }
    } catch (err) {
      // BUG-04: Ignore AbortError and stale play calls
      if (currentPlayId !== this.playId || err.name === 'AbortError') {
        return;
      }
      this._updateState({ isPlaying: false, isBuffering: false });
      throw err;
    }
  }

  pause() {
    if (!this.audio) return;
    this.playId++;
    this.audio.pause();
    this._updateState({ isPlaying: false, isPaused: true, isBuffering: false });
    updateMediaSessionPlaybackState('paused');
  }

  togglePlay() {
    if (this.state.isPlaying) {
      this.pause();
    } else {
      this.play().catch(console.warn);
    }
  }

  seek(seconds) {
    if (!this.audio || isNaN(seconds)) return;
    const target = Math.max(0, Math.min(seconds, this.state.duration || seconds));
    this.currentTime = target;
    this.audio.currentTime = target;
    this._emitTime();
    updateMediaSessionPositionState({
      duration: this.state.duration,
      position: target
    });
  }

  setVolume(vol) {
    if (!this.audio) return;
    const clamped = Math.max(0, Math.min(1, vol));
    this.audio.volume = clamped;
    this.audio.muted = clamped === 0;
    this._updateState({ volume: clamped, isMuted: clamped === 0 });
  }

  toggleMute() {
    if (!this.audio) return;
    const nextMuted = !this.state.isMuted;
    this.audio.muted = nextMuted;
    this._updateState({ isMuted: nextMuted });
  }
}

export const audioEngine = new AudioEngine();
