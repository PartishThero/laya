// components/cards/SongCard.jsx
import React from 'react';
import { VinylCard } from './VinylCard.jsx';

// Width here must match cardSize('song') in models/card.model.js (square: 200 x 200).
export function SongCard({ card, isPlaying = false }) {
  return (
    <VinylCard
      card={card}
      isPlaying={isPlaying}
      duration={card.meta?.duration}
      className="w-[200px]"
    />
  );
}
