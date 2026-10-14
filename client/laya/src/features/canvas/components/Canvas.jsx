// components/canvas/Canvas.jsx
import React, { useRef, useMemo, useCallback } from 'react';
import { useCanvasViewport } from '@/features/canvas/hooks/useCanvasViewport.js';
import { useChunkCards } from '@/features/canvas/hooks/useChunkCards.js';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts.js';
import { usePrefs } from '@/app/providers/PrefsContext.jsx';
import { usePlayer } from '@/features/player/context/PlayerContext.jsx';
import { getVisibleWorldBounds } from '@/features/canvas/engines/viewport.js';
import { getVisibleChunkCoords } from '@/features/canvas/engines/chunks.js';
import { CanvasBackground } from '@/features/canvas/components/CanvasBackground.jsx';
import { Chunk } from '@/features/canvas/components/Chunk.jsx';
import { RoamingZone } from '@/features/library/components/RoamingZone.jsx';
import { PositionNote } from '@/features/canvas/components/PositionNote.jsx';
import { ReturnHome } from '@/features/canvas/components/ReturnHome.jsx';
import { Card } from '@/components/cards/Card.jsx';
import { CANVAS_MODES } from '@/features/canvas/engines/canvasModes.js';

export function Canvas({ mode = 'home' }) {
  const containerRef = useRef(null);
  const { isListView } = usePrefs();
  const { playCard } = usePlayer();

  const {
    viewport,
    panBy,
    zoomBy,
    glideToOrigin,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp
  } = useCanvasViewport(containerRef);

  // Keyboard navigation
  useKeyboardShortcuts({
    onReturnHome: glideToOrigin,
    onPan: panBy,
    onZoom: zoomBy
  });

  // Calculate visible bounds and chunk coordinates (stabilize reference if keys unchanged)
  const prevVisibleChunksRef = useRef([]);
  const visibleChunks = useMemo(() => {
    const width = window.innerWidth || 1200;
    const height = window.innerHeight || 800;
    const bounds = getVisibleWorldBounds(viewport, width, height, 500);
    const coords = getVisibleChunkCoords(bounds);
    const prev = prevVisibleChunksRef.current;
    if (
      prev.length === coords.length &&
      prev.every((p, i) => p.key === coords[i].key)
    ) {
      return prev;
    }
    prevVisibleChunksRef.current = coords;
    return coords;
  }, [viewport]);

  // Load cards for visible chunks
  const { chunks, loadingChunks } = useChunkCards(visibleChunks, mode);

  // Time of day greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const isAtOrigin = Math.abs(viewport.x) < 80 && Math.abs(viewport.y) < 80;

  // Flatten cards for accessible List View
  const allCardsList = useMemo(() => {
    const list = [];
    chunks.forEach(placedList => {
      placedList.forEach(p => list.push(p.card));
    });
    return list;
  }, [chunks]);

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="relative w-screen h-screen overflow-hidden bg-paper cursor-grab active:cursor-grabbing select-none"
      style={{ touchAction: 'none' }}
    >
      {/* ACCESSIBLE LIST VIEW ALTERNATIVE */}
      {isListView ? (
        <div className="absolute inset-0 pt-20 pb-28 px-6 max-w-4xl mx-auto overflow-y-auto cursor-default">
          <div className="mb-6 border-b border-rule pb-3">
            <h1 className="font-serif italic text-2xl text-ink">
              {CANVAS_MODES[mode]?.name || 'Catalogue'} (List View)
            </h1>
            <p className="text-xs font-mono text-ink-soft mt-1">
              Accessible linear presentation. Press L or click Canvas in nav to return.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {allCardsList.map(card => (
              <div key={card.id} className="flex justify-center">
                <Card
                  card={card}
                  tilt={0}
                  onClick={() => playCard(card, allCardsList)}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* 2D CANVAS PLANE */
        <>
          {/* Subtle moving dot/rule background */}
          <CanvasBackground viewport={viewport} />

          {/* Time of day gentle editorial greeting anchored near origin */}
          {mode === 'home' && isAtOrigin && (
            <div
              className="absolute pointer-events-none transition-opacity duration-300 z-10"
              style={{
                left: `${viewport.x + window.innerWidth / 2 - 180}px`,
                top: `${viewport.y + 140}px`,
                transform: `scale(${viewport.scale})`
              }}
            >
              <div className="text-center">
                <h2 className="font-serif italic text-2xl md:text-3xl text-ink/80 font-normal">
                  {greeting}.
                </h2>
                <p className="font-mono text-xs text-ink-soft/70 mt-1 tracking-tight">
                  Wander through the collection. Click a record to hear it.
                </p>
              </div>
            </div>
          )}

          {/* The World Container (strictly 2D translate & scale) */}
          <div
            className="absolute top-0 left-0 w-0 h-0 pointer-events-none will-change-transform"
            style={{
              transform: `translate3d(${viewport.x}px, ${viewport.y}px, 0) scale(${viewport.scale})`,
              transformOrigin: '0 0'
            }}
          >
            {/* Render spatial chunks */}
            {visibleChunks.map(({ cx, cy, key }) => (
              <Chunk
                key={key}
                cx={cx}
                cy={cy}
                placedCards={chunks.get(key) || []}
                isLoading={loadingChunks.has(key)}
                onCardClick={(c) => playCard(c, allCardsList)}
                onPanCanvas={panBy}
              />
            ))}

            {/* Roaming drop zone tray placed in the world plane */}
            <RoamingZone viewport={viewport} />
          </div>

          {/* Fixed spatial annotations */}
          <div className="fixed bottom-24 left-6 z-[100] flex items-center gap-3">
            <PositionNote viewport={viewport} />
            <ReturnHome
              onClick={glideToOrigin}
              isOffset={!isAtOrigin}
            />
          </div>
        </>
      )}
    </div>
  );
}
