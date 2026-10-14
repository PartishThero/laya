// hooks/useKeyboardShortcuts.js
import { useEffect, useRef } from 'react';
import { usePlayerActions } from '@/features/player/context/PlayerContext.jsx';
import { usePrefs } from '@/app/providers/PrefsContext.jsx';

export function useKeyboardShortcuts({ onReturnHome, onPan, onZoom } = {}) {
  const { togglePlay } = usePlayerActions();
  const { toggleDock, toggleListView } = usePrefs();

  // Store latest callbacks in a ref to keep the window listener completely stable (BUG-11)
  const callbacksRef = useRef({
    onReturnHome,
    onPan,
    onZoom,
    togglePlay,
    toggleDock,
    toggleListView
  });

  callbacksRef.current = {
    onReturnHome,
    onPan,
    onZoom,
    togglePlay,
    toggleDock,
    toggleListView
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if inside an input, textarea, or contentEditable
      if (
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.isContentEditable
      ) {
        return;
      }

      const {
        onReturnHome: returnHome,
        onPan: pan,
        onZoom: zoom,
        togglePlay: play,
        toggleDock: dock,
        toggleListView: list
      } = callbacksRef.current;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (play) play();
          break;
        case 'h':
        case 'H':
          e.preventDefault();
          if (returnHome) returnHome();
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          if (dock) dock();
          break;
        case 'l':
        case 'L':
          e.preventDefault();
          if (list) list();
          break;
        case '+':
        case '=':
          e.preventDefault();
          if (zoom) zoom(1.15);
          break;
        case '-':
        case '_':
          e.preventDefault();
          if (zoom) zoom(0.85);
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (pan) pan(0, 50);
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (pan) pan(0, -50);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (pan) pan(50, 0);
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (pan) pan(-50, 0);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}

