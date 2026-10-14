// hooks/useDropZone.js
import { useRef, useEffect, useState } from 'react';
import { hitTester } from '../engines/dnd/hitTest.js';
import { dragController, DRAG_STATES } from '../engines/dnd/dragController.js';

export function useDropZone({ id, type, payload = {} }) {
  const zoneRef = useRef(null);
  const [isOver, setIsOver] = useState(false);
  const [isNear, setIsNear] = useState(false);

  useEffect(() => {
    const unregister = hitTester.registerZone(id, {
      id,
      type,
      ...payload,
      getBounds: () => zoneRef.current?.getBoundingClientRect() || null
    });

    const unsubscribe = dragController.subscribe((state) => {
      if (state.status === DRAG_STATES.IDLE) {
        setIsOver(false);
        setIsNear(false);
        return;
      }

      setIsOver(state.target?.id === id);
      setIsNear(Boolean(state.isNearTarget && state.target?.id === id));
    });

    return () => {
      unregister();
      unsubscribe();
    };
  }, [id, type, JSON.stringify(payload)]);

  return { zoneRef, isOver, isNear };
}
