// components/canvas/Chunk.jsx
import React from 'react';
import { Card } from '@/components/cards/Card.jsx';
import { CardSkeleton } from '@/components/cards/CardSkeleton.jsx';
import { CHUNK_WIDTH, CHUNK_HEIGHT } from '@/features/canvas/engines/chunks.js';

export function Chunk({ cx, cy, placedCards, isLoading, onCardClick, onPanCanvas }) {
  const worldX = cx * CHUNK_WIDTH;
  const worldY = cy * CHUNK_HEIGHT;

  return (
    <div
      className="absolute top-0 left-0 pointer-events-none"
      style={{
        transform: `translate3d(${worldX}px, ${worldY}px, 0)`,
        width: `${CHUNK_WIDTH}px`,
        height: `${CHUNK_HEIGHT}px`
      }}
    >


      {isLoading && (!placedCards || placedCards.length === 0) ? (
        <div className="relative w-full h-full p-10 flex flex-wrap gap-8 items-center justify-center">
          <CardSkeleton kind="song" tilt={-2} />
          <CardSkeleton kind="album" tilt={3} />
          <CardSkeleton kind="song" tilt={1} />
        </div>
      ) : (
        placedCards?.map((item) => (
          <div
            key={item.card.id}
            className="absolute pointer-events-auto"
            style={{
              transform: `translate3d(${item.localX}px, ${item.localY}px, 0)`,
              zIndex: item.zIndex
            }}
          >
            <Card
              card={item.card}
              tilt={item.tilt}
              onClick={onCardClick}
              onPanCanvas={onPanCanvas}
            />
          </div>
        ))
      )}
    </div>
  );
}
