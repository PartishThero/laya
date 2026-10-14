// lib/audio/mediaSession.js
// OS Media Keys, Lock Screen, and Control Center media integration

export function updateMediaSession(track, handlers = {}) {
  if (typeof window === 'undefined' || !('mediaSession' in navigator) || !track) {
    return;
  }

  const artwork = [];
  if (track.artUrl) {
    artwork.push(
      { src: track.artUrl, sizes: '96x96', type: 'image/jpeg' },
      { src: track.artUrl, sizes: '128x128', type: 'image/jpeg' },
      { src: track.artUrl, sizes: '256x256', type: 'image/jpeg' },
      { src: track.artUrl, sizes: '512x512', type: 'image/jpeg' }
    );
  }

  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title || 'Unknown Title',
      artist: track.artist || track.subtitle || 'Unknown Artist',
      album: track.album || track.subtitle || '',
      artwork
    });
  } catch (e) {
    // Non-critical if MediaMetadata construction fails
  }

  const setAction = (action, handler) => {
    try {
      if (handler) {
        navigator.mediaSession.setActionHandler(action, handler);
      } else {
        navigator.mediaSession.setActionHandler(action, null);
      }
    } catch {
      // Browser might not support this action
    }
  };

  setAction('play', handlers.onPlay || null);
  setAction('pause', handlers.onPause || null);
  setAction('nexttrack', handlers.onNext || null);
  setAction('previoustrack', handlers.onPrev || null);
  setAction('seekto', handlers.onSeek ? (details) => handlers.onSeek(details.seekTime) : null);
}

export function updateMediaSessionPlaybackState(state) {
  if (typeof window === 'undefined' || !('mediaSession' in navigator)) {
    return;
  }
  try {
    // 'none' | 'paused' | 'playing'
    navigator.mediaSession.playbackState = state;
  } catch {
    // Ignore
  }
}

export function updateMediaSessionPositionState({ duration = 0, playbackRate = 1, position = 0 }) {
  if (
    typeof window === 'undefined' ||
    !('mediaSession' in navigator) ||
    !navigator.mediaSession.setPositionState
  ) {
    return;
  }
  try {
    if (duration > 0 && position >= 0 && position <= duration) {
      navigator.mediaSession.setPositionState({
        duration,
        playbackRate,
        position
      });
    }
  } catch {
    // Ignore
  }
}
