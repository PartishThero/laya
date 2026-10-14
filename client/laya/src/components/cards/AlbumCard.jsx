// components/cards/AlbumCard.jsx
import React from 'react';
import { VinylCard } from './VinylCard.jsx';

// Width here must match cardSize('album') in models/card.model.js (square: 260 x 260).
export function AlbumCard({ card, isPlaying = false }) {
  return (
    <VinylCard
      card={card}
      isPlaying={isPlaying}
      duration={card.meta?.duration}
      className="w-[260px]"
    />
  );
}
