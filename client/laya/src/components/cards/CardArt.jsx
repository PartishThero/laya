// components/cards/CardArt.jsx
import React, { useState } from 'react';
import { fallbackArt } from '../../models/card.model.js';

// `bare` removes the thin border so the art can sit flush inside VinylCard.
export function CardArt({ card, className = '', alt = '', bare = false }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const fallbackBg = fallbackArt(card);

  return (
    <div
      className={`relative overflow-hidden bg-paper-2 ${
        bare ? '' : 'border border-rule/30'
      } flex items-center justify-center select-none ${className}`}
      style={{ backgroundColor: error || !card?.artUrl ? fallbackBg : undefined }}
    >
      {card?.artUrl && !error ? (
        <img
          src={card.artUrl}
          alt={alt || card.title}
          loading="lazy"
          draggable={false}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-full object-cover transition-opacity duration-300 pointer-events-none ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ) : (
        <div className="flex flex-col items-center justify-center p-3 text-center">
          <span className="font-serif italic text-2xl text-paper opacity-80 leading-none">
            {card?.title ? card.title.charAt(0).toUpperCase() : 'L'}
          </span>
          <span className="text-[9px] font-mono tracking-widest uppercase text-paper/60 mt-1">
            {card?.kind || 'print'}
          </span>
        </div>
      )}
    </div>
  );
}
