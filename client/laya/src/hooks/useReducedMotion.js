// hooks/useReducedMotion.js
import { useState, useEffect } from 'react';

export function useReducedMotion() {
  const [matches, setMatches] = useState(() => {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  });

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!media) return;

    const listener = (e) => setMatches(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  return matches;
}
