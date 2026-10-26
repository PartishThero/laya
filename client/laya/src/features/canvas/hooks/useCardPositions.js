// features/canvas/hooks/useCardPositions.js
// Spatial persistence and positioning state for user-moved canvas cards (individual user-specific)
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext.jsx';

const STORAGE_PREFIX = 'laya_card_positions_';
const PURGE_FLAG = 'laya_table_cleared_v5';

// Clear stale cached card positions from storage on initial run
if (typeof window !== 'undefined') {
  try {
    if (!localStorage.getItem(PURGE_FLAG)) {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
      localStorage.setItem(PURGE_FLAG, 'true');
    }
  } catch (e) {
    console.warn('Storage purge error:', e);
  }
}

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
      if (!saved) return {};
      const parsed = JSON.parse(saved);
      const normalized = {};
      Object.entries(parsed).forEach(([id, item]) => {
        if (item && item.card) {
          normalized[id] = { ...item, tilt: 0 };
        }
      });
      return normalized;
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
      const normalized = {};
      Object.entries(parsed).forEach(([id, item]) => {
        if (item && item.card) {
          normalized[id] = { ...item, tilt: 0 };
        }
      });
      setPositions(normalized);

      let maxZ = 100;
      Object.values(normalized).forEach(item => {
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
  const moveCard = useCallback((card, worldX, worldY) => {
    highestZIndexRef.current += 1;
    const nextZ = highestZIndexRef.current;

    setPositions(prev => {
      const next = {
        ...prev,
        [card.id]: {
          card,
          worldX: Math.round(worldX),
          worldY: Math.round(worldY),
          tilt: 0,
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

  // Remove a single card from the table
  const removeMovedCard = useCallback((cardId) => {
    setPositions(prev => {
      const next = { ...prev };
      delete next[cardId];
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to update card positions:', e);
      }
      return next;
    });
  }, [storageKey]);

  // Check if a card has been moved by the user
  const isCardMoved = useCallback((cardId) => {
    return Boolean(positions[cardId]);
  }, [positions]);

  // Reset custom layout and wipe all moved cards
  const resetPositions = useCallback(() => {
    setPositions({});
    try {
      localStorage.removeItem(storageKey);
      localStorage.removeItem(`${STORAGE_PREFIX}${mode}`);
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(k);
        }
      });
    } catch (e) {
      console.warn('Failed to reset card positions:', e);
    }
  }, [storageKey, mode]);

  const movedCardsList = Object.values(positions);

  return {
    positions,
    movedCardsList,
    moveCard,
    removeMovedCard,
    isCardMoved,
    resetPositions
  };
}
