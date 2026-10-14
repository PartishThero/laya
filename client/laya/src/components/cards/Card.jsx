// components/cards/Card.jsx
import React from 'react';
import { SongCard } from './SongCard.jsx';
import { AlbumCard } from './AlbumCard.jsx';
import { PlaylistCard } from './PlaylistCard.jsx';
import { CardGhost } from './CardGhost.jsx';
import { useDraggableCard } from '../../hooks/useDraggableCard.js';
import { usePlayer } from '../../context/PlayerContext.jsx';
import { useDrag } from '../../context/DragContext.jsx';
import { useQueue } from '../../context/QueueContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { cardLabel } from '../../models/card.model.js';

export function Card({ card, tilt = 0, onClick, onPanCanvas }) {
  const { currentTrack } = usePlayer();
  const { dragState } = useDrag();
  const { queueCard } = useQueue();
  const { addToast } = useToast();

  const isCurrentPlaying = currentTrack?.id === card.id;
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
      aria-pressed={isCurrentPlaying}
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
        <AlbumCard card={card} isPlaying={isCurrentPlaying} />
      ) : card.kind === 'playlist' ? (
        <PlaylistCard card={card} isPlaying={isCurrentPlaying} />
      ) : (
        <SongCard card={card} isPlaying={isCurrentPlaying} />
      )}
    </div>
  );
}
