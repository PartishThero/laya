// components/cards/Card.jsx
import React, { useSyncExternalStore } from 'react';
import { SongCard } from './SongCard.jsx';
import { AlbumCard } from './AlbumCard.jsx';
import { PlaylistCard } from './PlaylistCard.jsx';
import { CardGhost } from './CardGhost.jsx';
import { useDraggableCard } from '@/hooks/useDraggableCard.js';
import { audioEngine } from '@/lib/audio/audioEngine.js';
import { useDrag } from '@/app/providers/DragContext.jsx';
import { useQueue } from '@/features/player/context/QueueContext.jsx';
import { useToast } from '@/app/providers/ToastContext.jsx';
import { cardLabel } from '@/models/card.model.js';

// Cache status objects per cardId to avoid new object references in getSnapshot
const statusCache = new Map();

export function useCardPlaybackStatus(cardId) {
  return useSyncExternalStore(
    audioEngine.subscribe,
    () => {
      const snap = audioEngine.getSnapshot();
      const isCurrent = snap.currentTrack?.id === cardId;
      const isPaused = isCurrent ? snap.isPaused : false;
      const duration = isCurrent ? snap.duration : 0;

      const cached = statusCache.get(cardId);
      if (
        cached &&
        cached.isCurrent === isCurrent &&
        cached.isPaused === isPaused &&
        cached.duration === duration
      ) {
        return cached;
      }
      const next = { isCurrent, isPaused, duration };
      statusCache.set(cardId, next);
      return next;
    }
  );
}

export const Card = React.memo(function Card({ card, tilt = 0, onClick, onPanCanvas }) {
  const { isCurrent, isPaused, duration } = useCardPlaybackStatus(card.id);
  const { dragState } = useDrag();
  const { queueCard } = useQueue();
  const { addToast } = useToast();

  const isBeingDragged = dragState?.card?.id === card.id;

  const {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp
  } = useDraggableCard({
    card,
    onClick,
    tilt,
    onPanCanvas
  });

  // Accessible keyboard handler
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (onClick) onClick(card);
    } else if (e.key === 'q' || e.key === 'Q') {
      e.preventDefault();
      queueCard(card);
      addToast(`Queued "${card.title}"`, 'info');
    }
  };

  if (isBeingDragged) {
    return <CardGhost kind={card.kind} tilt={tilt} />;
  }

  // Song + album cards are squircles (VinylCard), playlist keeps the folder look
  const radius = card.kind === 'playlist' ? 'rounded-sm' : 'rounded-[22%]';

  return (
    <div
      tabIndex={0}
      role="button"
      data-draggable="true"
      aria-pressed={isCurrent}
      aria-label={cardLabel(card)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onKeyDown={handleKeyDown}
      className={`relative cursor-pointer touch-none outline-none focus-visible:ring-2 focus-visible:ring-accent transition-transform duration-200 hover:rotate-0 hover:-translate-y-1 active:scale-[0.97] ${radius}`}
      style={{
        transform: `rotate(${tilt}deg)`,
        willChange: 'transform'
      }}
    >
      {card.kind === 'album' ? (
        <AlbumCard
          card={card}
          isPlaying={isCurrent}
          isPaused={isPaused}
          duration={duration || card.meta?.duration}
        />
      ) : card.kind === 'playlist' ? (
        <PlaylistCard
          card={card}
          isPlaying={isCurrent}
        />
      ) : (
        <SongCard
          card={card}
          isPlaying={isCurrent}
          isPaused={isPaused}
          duration={duration || card.meta?.duration}
        />
      )}
    </div>
  );
});
