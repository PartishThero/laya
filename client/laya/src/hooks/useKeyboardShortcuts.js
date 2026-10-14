// hooks/useKeyboardShortcuts.js
import { useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext.jsx';
import { usePrefs } from '../context/PrefsContext.jsx';

export function useKeyboardShortcuts({ onReturnHome, onPan, onZoom }) {
  const { togglePlay } = usePlayer();
  const { toggleDock, toggleListView } = usePrefs();

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

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'h':
        case 'H':
          e.preventDefault();
          if (onReturnHome) onReturnHome();
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          toggleDock();
          break;
        case 'l':
        case 'L':
          e.preventDefault();
          toggleListView();
          break;
        case '+':
        case '=':
          e.preventDefault();
          if (onZoom) onZoom(1.15);
          break;
        case '-':
        case '_':
          e.preventDefault();
          if (onZoom) onZoom(0.85);
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (onPan) onPan(0, 50);
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (onPan) onPan(0, -50);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (onPan) onPan(50, 0);
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (onPan) onPan(-50, 0);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, toggleDock, toggleListView, onReturnHome, onPan, onZoom]);
}
