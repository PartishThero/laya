// components/canvas/Canvas.jsx
import React, { useRef, useMemo, useCallback, useEffect } from 'react';
import { useCanvasViewport } from '@/features/canvas/hooks/useCanvasViewport.js';
import { useChunkCards } from '@/features/canvas/hooks/useChunkCards.js';
import { useCardPositions } from '@/features/canvas/hooks/useCardPositions.js';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts.js';
import { usePrefs } from '@/app/providers/PrefsContext.jsx';
import { usePlayer } from '@/features/player/context/PlayerContext.jsx';
import { useDrag } from '@/app/providers/DragContext.jsx';
import { useAddMusic } from '@/app/providers/AddMusicContext.jsx';
import { getVisibleWorldBounds, screenToWorld } from '@/features/canvas/engines/viewport.js';
import { getVisibleChunkCoords } from '@/features/canvas/engines/chunks.js';
import { CanvasBackground } from '@/features/canvas/components/CanvasBackground.jsx';
import { Chunk } from '@/features/canvas/components/Chunk.jsx';
import { RoamingZone } from '@/features/library/components/RoamingZone.jsx';
import { PositionNote } from '@/features/canvas/components/PositionNote.jsx';
import { ReturnHome } from '@/features/canvas/components/ReturnHome.jsx';
import { Card } from '@/components/cards/Card.jsx';
import { CANVAS_MODES } from '@/features/canvas/engines/canvasModes.js';
import { Plus, Disc } from 'lucide-react';

export function Canvas({ mode = 'home' }) {
  const containerRef = useRef(null);
  const { isListView } = usePrefs();
  const { playCard } = usePlayer();
  const { openAddMusic } = useAddMusic();
  const { registerCanvasDropHandler } = useDrag();
  const { positions, movedCardsList, moveCard, isCardMoved } = useCardPositions(mode);

  const {
    viewport,
    panBy,
    zoomBy,
    glideToOrigin,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp
  } = useCanvasViewport(containerRef);

  const viewportRef = useRef(viewport);
  viewportRef.current = viewport;

  // Handle dropping cards anywhere on the infinite canvas
  useEffect(() => {
    const handleCanvasDrop = ({ card, origin, current }) => {
      const vp = viewportRef.current;
      const offsetX = origin?.offsetX ?? 100;
      const offsetY = origin?.offsetY ?? 100;

      const screenLeft = current.screenX - offsetX;
      const screenTop = current.screenY - offsetY;

      const world = screenToWorld(screenLeft, screenTop, vp);
      moveCard(card, world.x, world.y, origin?.tilt ?? 0);
      return true;
    };

    return registerCanvasDropHandler(handleCanvasDrop);
  }, [registerCanvasDropHandler, moveCard]);

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

  // Flatten cards for accessible List View (including user-moved cards)
  const allCardsList = useMemo(() => {
    const map = new Map();
    chunks.forEach(placedList => {
      placedList.forEach(p => map.set(p.card.id, p.card));
    });
    movedCardsList.forEach(item => {
      map.set(item.card.id, item.card);
    });
    return Array.from(map.values());
  }, [chunks, movedCardsList]);

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

          {allCardsList.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-rule rounded-sm p-8 max-w-md mx-auto">
              <Disc className="w-10 h-10 mx-auto mb-3 text-accent animate-pulse" />
              <h3 className="font-serif italic text-xl text-ink">
                Catalogue is empty.
              </h3>
              <p className="font-mono text-xs text-ink-soft mt-1 mb-5">
                Upload audio files or add a stream link to add your first track.
              </p>
              <button
                onClick={openAddMusic}
                className="px-4 py-2 bg-ink text-paper rounded-xs hover:bg-accent font-mono text-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Record</span>
              </button>
            </div>
          ) : (
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
          )}
        </div>
      ) : (
        /* 2D CANVAS PLANE */
        <>
          {/* Subtle moving dot/rule background */}
          <CanvasBackground viewport={viewport} />

          {/* Empty state invitation when no records are on the table */}
          {allCardsList.length === 0 && loadingChunks.size === 0 && (
            <div
              className="absolute pointer-events-auto z-20 flex flex-col items-center justify-center text-center p-8 border border-dashed border-rule/80 bg-paper/95 backdrop-blur-md rounded-sm shadow-lg max-w-sm"
              style={{
                left: `${viewport.x + (typeof window !== 'undefined' ? window.innerWidth : 1200) / 2 - 180}px`,
                top: `${viewport.y + (typeof window !== 'undefined' ? window.innerHeight : 800) / 2 - 140}px`,
                transform: `scale(${viewport.scale})`,
                transformOrigin: 'center center'
              }}
            >
              <div className="w-14 h-14 rounded-full bg-paper-tint/60 border border-rule flex items-center justify-center mb-3">
                <Disc className="w-7 h-7 text-accent" />
              </div>
              <h3 className="font-serif italic text-2xl text-ink">
                The turntable is empty.
              </h3>
              <p className="font-mono text-xs text-ink-soft mt-1.5 mb-5 max-w-xs leading-relaxed">
                Add songs from your audio files or direct stream links to place your first record onto the table.
              </p>
              <button
                onClick={openAddMusic}
                className="px-5 py-2.5 bg-ink text-paper rounded-xs hover:bg-accent font-mono text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Add Your First Record</span>
              </button>
            </div>
          )}

          {/* Time of day gentle editorial greeting anchored near origin */}
          {mode === 'home' && isAtOrigin && allCardsList.length > 0 && (
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
            {/* Render spatial chunks (excluding user-moved cards) */}
            {visibleChunks.map(({ cx, cy, key }) => (
              <Chunk
                key={key}
                cx={cx}
                cy={cy}
                placedCards={(chunks.get(key) || []).filter(item => !isCardMoved(item.card.id))}
                isLoading={loadingChunks.has(key)}
                onCardClick={(c) => playCard(c, allCardsList)}
                onPanCanvas={panBy}
              />
            ))}

            {/* User-moved physical cards positioned anywhere on canvas */}
            {movedCardsList.map(item => (
              <div
                key={item.card.id}
                className="absolute pointer-events-auto"
                style={{
                  transform: `translate3d(${item.worldX}px, ${item.worldY}px, 0)`,
                  zIndex: item.zIndex || 50
                }}
              >
                <Card
                  card={item.card}
                  tilt={item.tilt}
                  onClick={(c) => playCard(c, allCardsList)}
                  onPanCanvas={panBy}
                />
              </div>
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
