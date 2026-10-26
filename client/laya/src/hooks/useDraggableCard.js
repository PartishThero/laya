// hooks/useDraggableCard.js
import { useRef, useCallback, useEffect } from 'react';
import { dragController } from '@/lib/dnd/dragController.js';
import { hitTester } from '@/lib/dnd/hitTest.js';

export function useDraggableCard({ card, onClick, tilt = 0, onPanCanvas }) {
  const pointerStartRef = useRef(null);
  const pointerOffsetRef = useRef(null);
  const isDraggingCardRef = useRef(false);
  const longPressTimerRef = useRef(null);

  // Clean up any pending long-press timers on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    };
  }, []);

  const startDrag = useCallback((e, startPoint) => {
    isDraggingCardRef.current = true;

    const grab = pointerOffsetRef.current || {
      offsetX: 100,
      offsetY: 100,
      width: 200,
      height: 200
    };

    // DragController owns the auto-pan requestAnimationFrame loop
    dragController.startLift(
      card,
      {
        screenX: startPoint.x,
        screenY: startPoint.y,
        offsetX: grab.offsetX,
        offsetY: grab.offsetY,
        width: grab.width,
        height: grab.height,
        tilt: 0
      },
      onPanCanvas
    );
  }, [card, onPanCanvas]);

  const handlePointerDown = useCallback((e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    isDraggingCardRef.current = false;

    if (e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      pointerOffsetRef.current = {
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
        width: rect.width,
        height: rect.height
      };
    }

    // For touch devices: long-press ~250ms picks up card
    if (e.pointerType === 'touch') {
      longPressTimerRef.current = setTimeout(() => {
        if (pointerStartRef.current) {
          startDrag(e, pointerStartRef.current);
        }
      }, 250);
    }
  }, [startDrag]);

  const handlePointerMove = useCallback((e) => {
    if (!pointerStartRef.current) return;

    const dx = e.clientX - pointerStartRef.current.x;
    const dy = e.clientY - pointerStartRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Cancel long press timer if moved
    if (distance > 10 && longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (!isDraggingCardRef.current) {
      // Mouse/pen threshold >= 6px initiates drag
      if (e.pointerType !== 'touch' && distance >= 6) {
        startDrag(e, pointerStartRef.current);
      }
    } else {
      // Actively dragging: test drop target
      const hitResult = hitTester.testPoint(e.clientX, e.clientY);
      dragController.updatePosition(e.clientX, e.clientY, hitResult);
    }
  }, [startDrag]);

  const handlePointerUp = useCallback((e) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (!isDraggingCardRef.current) {
      // Was a click/tap
      if (onClick) {
        onClick(card);
      }
    }

    pointerStartRef.current = null;
    isDraggingCardRef.current = false;
  }, [card, onClick]);

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp
  };
}
