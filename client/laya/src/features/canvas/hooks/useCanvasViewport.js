// hooks/useCanvasViewport.js
import { useState, useRef, useCallback, useEffect } from 'react';
import { zoomAtPoint, MIN_ZOOM, MAX_ZOOM } from '@/features/canvas/engines/viewport.js';
import { PanMomentumTracker } from '@/features/canvas/engines/momentum.js';

export function useCanvasViewport(containerRef) {
  const [viewport, setViewport] = useState({ x: 0, y: 0, scale: 1.0 });
  const viewportRef = useRef(viewport);
  viewportRef.current = viewport;

  const isDraggingRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const momentumTracker = useRef(new PanMomentumTracker());
  const animationFrameRef = useRef(null);

  // Cancel any running animation loop when unmounting (BUG-08)
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, []);

  // Smooth return home glide
  const glideToOrigin = useCallback(() => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

    const startX = viewportRef.current.x;
    const startY = viewportRef.current.y;
    const startScale = viewportRef.current.scale;
    const targetScale = 1.0;
    const startTime = performance.now();
    const duration = 500;

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);

      const nextX = startX + (0 - startX) * ease;
      const nextY = startY + (0 - startY) * ease;
      const nextScale = startScale + (targetScale - startScale) * ease;

      setViewport({ x: nextX, y: nextY, scale: nextScale });

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  }, []);

  // Pan by dx, dy
  const panBy = useCallback((dx, dy) => {
    setViewport(v => ({ ...v, x: v.x + dx, y: v.y + dy }));
  }, []);

  // Zoom by factor around screen center or pointer
  const zoomBy = useCallback((factor, screenX, screenY) => {
    setViewport(v => {
      const cx = screenX ?? (window.innerWidth / 2);
      const cy = screenY ?? (window.innerHeight / 2);
      return zoomAtPoint(v, factor, cx, cy);
    });
  }, []);

  // Pointer event handlers for panning canvas
  const handlePointerDown = useCallback((e) => {
    // Only left click or primary touch on the background canvas directly
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if (e.target.closest('[data-draggable="true"]') || e.target.closest('[data-interactive="true"]')) {
      return;
    }

    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

    isDraggingRef.current = true;
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
    momentumTracker.current.reset();
    momentumTracker.current.addPoint(e.clientX, e.clientY);
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (!isDraggingRef.current) return;

    const dx = e.clientX - lastPointerRef.current.x;
    const dy = e.clientY - lastPointerRef.current.y;
    lastPointerRef.current = { x: e.clientX, y: e.clientY };

    momentumTracker.current.addPoint(e.clientX, e.clientY);
    panBy(dx, dy);
  }, [panBy]);

  const handlePointerUp = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    // Apply deceleration momentum
    const { vx, vy } = momentumTracker.current.getVelocity();
    const speed = Math.sqrt(vx * vx + vy * vy);

    if (speed > 0.15) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      let currentVx = vx * 18;
      let currentVy = vy * 18;

      const stepMomentum = () => {
        currentVx *= 0.88;
        currentVy *= 0.88;

        if (Math.abs(currentVx) < 0.2 && Math.abs(currentVy) < 0.2) {
          return;
        }

        panBy(currentVx, currentVy);
        animationFrameRef.current = requestAnimationFrame(stepMomentum);
      };

      animationFrameRef.current = requestAnimationFrame(stepMomentum);
    }
  }, [panBy]);

  // Wheel event for trackpad pan & zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e) => {
      e.preventDefault();

      if (e.ctrlKey || e.metaKey) {
        // Pinch-to-zoom
        const factor = Math.exp(-e.deltaY * 0.01);
        zoomBy(factor, e.clientX, e.clientY);
      } else {
        // Trackpad 2-finger scroll or mouse wheel panning
        panBy(-e.deltaX, -e.deltaY);
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [containerRef, panBy, zoomBy]);

  return {
    viewport,
    setViewport,
    panBy,
    zoomBy,
    glideToOrigin,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp
  };
}
