// components/drag/DragLayer.jsx
import React, { useEffect } from 'react';
import { useDrag } from '@/app/providers/DragContext.jsx';
import { DRAG_STATES } from '@/lib/dnd/dragController.js';
import { SongCard } from '../cards/SongCard.jsx';
import { AlbumCard } from '../cards/AlbumCard.jsx';
import { PlaylistCard } from '../cards/PlaylistCard.jsx';

export function DragLayer() {
  const { dragState, handleDrop } = useDrag();
  const { status, card, current, target } = dragState;

  useEffect(() => {
    if (status === DRAG_STATES.IDLE) return;

    const handlePointerUpGlobal = () => {
      handleDrop();
    };

    window.addEventListener('pointerup', handlePointerUpGlobal);
    window.addEventListener('pointercancel', handlePointerUpGlobal);

    return () => {
      window.removeEventListener('pointerup', handlePointerUpGlobal);
      window.removeEventListener('pointercancel', handlePointerUpGlobal);
    };
  }, [status, handleDrop]);

  if (status === DRAG_STATES.IDLE || !card || !current) {
    return null;
  }

  const isOverTarget = status === DRAG_STATES.OVER_TARGET || status === DRAG_STATES.DROPPED_PENDING;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[1000] select-none"
      aria-hidden="true"
    >
      <div
        className="absolute top-0 left-0 transition-transform duration-75 pointer-events-none"
        style={{
          transform: `translate3d(${current.screenX - 70}px, ${current.screenY - 70}px, 0) scale(${
            isOverTarget ? 0.92 : 1.05
          }) rotate(${isOverTarget ? 0 : 2}deg)`,
          filter: 'drop-shadow(0 16px 28px rgba(0,0,0,0.22))'
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
