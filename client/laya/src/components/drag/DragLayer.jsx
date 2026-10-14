// components/drag/DragLayer.jsx
import React, { useEffect } from 'react';
import { useDrag } from '@/app/providers/DragContext.jsx';
import { DRAG_STATES } from '@/lib/dnd/dragController.js';
import { SongCard } from '@/components/cards/SongCard.jsx';
import { AlbumCard } from '@/components/cards/AlbumCard.jsx';
import { PlaylistCard } from '@/components/cards/PlaylistCard.jsx';

export function DragLayer() {
  const { dragState, handleDrop } = useDrag();
  const { status, card, current, target, origin } = dragState;

  useEffect(() => {
    if (status === DRAG_STATES.IDLE) return;

    const handlePointerUpGlobal = () => {
      handleDrop();
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        dragController.cancel();
      }
    };

    window.addEventListener('pointerup', handlePointerUpGlobal);
    window.addEventListener('pointercancel', handlePointerUpGlobal);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('pointerup', handlePointerUpGlobal);
      window.removeEventListener('pointercancel', handlePointerUpGlobal);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [status, handleDrop]);

  if (status === DRAG_STATES.IDLE || !card || !current) {
    return null;
  }

  const isOverTarget = status === DRAG_STATES.OVER_TARGET || status === DRAG_STATES.DROPPED_PENDING;
  const offsetX = origin?.offsetX ?? 100;
  const offsetY = origin?.offsetY ?? 100;
  const tilt = isOverTarget ? 0 : (origin?.tilt ?? 2);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[1000] select-none"
      aria-hidden="true"
    >
      <div
        className="absolute top-0 left-0 transition-transform duration-75 pointer-events-none"
        style={{
          transform: `translate3d(${current.screenX - offsetX}px, ${current.screenY - offsetY}px, 0) scale(${
            isOverTarget ? 0.92 : 1.05
          }) rotate(${tilt}deg)`,
          filter: 'drop-shadow(0 20px 36px rgba(0,0,0,0.26))'
        }}
      >
        {card.kind === 'album' ? (
          <AlbumCard card={card} />
        ) : card.kind === 'playlist' ? (
          <PlaylistCard card={card} />
        ) : (
          <SongCard card={card} />
        )}

        {/* Drop target preview tag */}
        {target && (
          <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-ink text-paper text-[10px] font-mono px-2 py-0.5 rounded-sm tracking-wide whitespace-nowrap shadow-md">
            DROP TO {target.type === 'now-playing' ? 'QUEUE' : 'ADD TO PLAYLIST'}
          </div>
        )}
      </div>
    </div>
  );
}
