// features/canvas/hooks/useCardPositions.js
// Spatial persistence and positioning state for user-moved canvas cards
import { useState, useEffect, useRef, useCallback } from 'react';

const STORAGE_PREFIX = 'laya_card_positions_';

export function useCardPositions(mode = 'home') {
  const storageKey = `${STORAGE_PREFIX}${mode}`;

  const [positions, setPositions] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const highestZIndexRef = useRef(100);

  // Sync positions when canvas mode changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
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
  }, [storageKey]);

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
