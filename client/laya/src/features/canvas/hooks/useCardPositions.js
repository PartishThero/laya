// features/canvas/hooks/useCardPositions.js
// Spatial persistence and positioning state for user-moved canvas cards (individual user-specific)
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext.jsx';

const STORAGE_PREFIX = 'laya_card_positions_';

export function useCardPositions(mode = 'home') {
  const { user } = useAuth();
  const userId = user?._id || user?.id || user?.username || 'guest';
  const storageKey = `${STORAGE_PREFIX}${userId}_${mode}`;

  const [positions, setPositions] = useState(() => {
    try {
      // Check user-specific key, or migrate from legacy shared key if available
      let saved = localStorage.getItem(storageKey);
      if (!saved) {
        const legacy = localStorage.getItem(`${STORAGE_PREFIX}${mode}`);
        if (legacy) {
          saved = legacy;
          localStorage.setItem(storageKey, legacy);
        }
      }
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const highestZIndexRef = useRef(100);

  // Sync positions when individual user or canvas mode changes
  useEffect(() => {
    try {
      let saved = localStorage.getItem(storageKey);
      if (!saved) {
        const legacy = localStorage.getItem(`${STORAGE_PREFIX}${mode}`);
        if (legacy) {
          saved = legacy;
          localStorage.setItem(storageKey, legacy);
        }
      }
      const parsed = saved ? JSON.parse(saved) : {};
      setPositions(parsed);

      let maxZ = 100;
      Object.values(parsed).forEach(item => {
        if (item.zIndex && item.zIndex > maxZ) {
          maxZ = item.zIndex;
        }
      });
      highestZIndexRef.current = maxZ;
    } catch {
      setPositions({});
    }
  }, [storageKey, mode]);

  // Place or move a card to an arbitrary world coordinate
  const moveCard = useCallback((card, worldX, worldY, tilt = 0) => {
    highestZIndexRef.current += 1;
    const nextZ = highestZIndexRef.current;

    setPositions(prev => {
      const next = {
        ...prev,
        [card.id]: {
          card,
          worldX: Math.round(worldX),
          worldY: Math.round(worldY),
          tilt: Math.round(tilt * 10) / 10,
          zIndex: nextZ
        }
      };

      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to save card positions to storage:', e);
      }

      return next;
    });
  }, [storageKey]);

  // Check if a card has been moved by the user
  const isCardMoved = useCallback((cardId) => {
    return Boolean(positions[cardId]);
  }, [positions]);

  // Reset custom layout if needed
  const resetPositions = useCallback(() => {
    setPositions({});
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {
      console.warn('Failed to reset card positions:', e);
    }
  }, [storageKey]);

  const movedCardsList = Object.values(positions);

  return {
    positions,
    movedCardsList,
    moveCard,
    isCardMoved,
    resetPositions
  };
}
