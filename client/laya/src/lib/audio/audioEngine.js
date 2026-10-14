// services/audio/audioEngine.js
// Singleton audio engine existing outside the React component tree

class AudioEngine {
  constructor() {
    this.audio = new Audio();
    this.audio.preload = 'metadata';
    this.listeners = new Set();
    this.currentTrack = null;
    this.state = {
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 0.8,
      isMuted: false,
      isLoading: false,
      error: null
    };

    this.audio.volume = this.state.volume;
    this._bindEvents();
  }

  _bindEvents() {
    this.audio.addEventListener('play', () => {
      this._updateState({ isPlaying: true, error: null });
    });

    this.audio.addEventListener('pause', () => {
      this._updateState({ isPlaying: false });
    });

    this.audio.addEventListener('timeupdate', () => {
      this._updateState({
        currentTime: this.audio.currentTime,
        duration: this.audio.duration || 0
      });
    });

    this.audio.addEventListener('loadedmetadata', () => {
      this._updateState({
        duration: this.audio.duration || 0,
        isLoading: false
      });
    });

    this.audio.addEventListener('waiting', () => {
      this._updateState({ isLoading: true });
    });

    this.audio.addEventListener('playing', () => {
      this._updateState({ isLoading: false });
    });

    this.audio.addEventListener('ended', () => {
      this._updateState({ isPlaying: false, currentTime: 0 });
      this._emit('ended');
    });

    this.audio.addEventListener('error', (e) => {
      const err = this.audio.error;
      const msg = err ? `Audio playback error (${err.code})` : 'Failed to load audio';
      this._updateState({ isPlaying: false, isLoading: false, error: msg });
      this._emit('error', msg);
    });
  }

  _updateState(partial) {
    this.state = { ...this.state, ...partial };
    this._emit('change', this.state);
  }

  _emit(eventName, payload) {
    this.listeners.forEach(fn => {
      try {
        fn(eventName, payload, this.state);
      } catch (e) {
        console.error('AudioEngine listener error:', e);
      }
    });
  }

  subscribe(callback) {
    this.listeners.add(callback);
    // Send initial state immediately
    callback('init', null, this.state);
    return () => {
      this.listeners.delete(callback);
    };
  }

  load(track) {
    if (!track || !track.audioUrl) {
      console.warn('Cannot play track without audioUrl:', track);
      return;
    }

    this.currentTrack = track;
    this.audio.src = track.audioUrl;
    this.audio.load();
    this._updateState({
      currentTime: 0,
      duration: track.meta?.duration || 0,
      isLoading: true,
      error: null
    });

    this.play().catch(err => {
      console.warn('Autoplay prevented or failed:', err);
    });
  }

  async play() {
    if (!this.audio.src) return;
    try {
      await this.audio.play();
    } catch (err) {
      this._updateState({ isPlaying: false, isLoading: false });
      throw err;
    }
  }

  pause() {
    this.audio.pause();
  }

  togglePlay() {
    if (this.state.isPlaying) {
      this.pause();
    } else {
      this.play().catch(console.warn);
    }
  }

  seek(seconds) {
    if (isNaN(seconds)) return;
    this.audio.currentTime = seconds;
    this._updateState({ currentTime: seconds });
  }

  setVolume(vol) {
    const clamped = Math.max(0, Math.min(1, vol));
    this.audio.volume = clamped;
    this.audio.muted = clamped === 0;
    this._updateState({ volume: clamped, isMuted: clamped === 0 });
  }

  toggleMute() {
    const nextMuted = !this.state.isMuted;
    this.audio.muted = nextMuted;
    this._updateState({ isMuted: nextMuted });
  }
}

export const audioEngine = new AudioEngine();
