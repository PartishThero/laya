// components/cards/CardGhost.jsx
import React from 'react';
import { cardSize } from '../../models/card.model.js';

export function CardGhost({ kind, tilt = 0 }) {
  const size = cardSize(kind);
  const radius = kind === 'playlist' ? 'rounded-sm' : 'rounded-[22%]';

  return (
    <div
      className={`border border-dashed border-ink/25 bg-ink/5 pointer-events-none transition-opacity duration-300 ${radius}`}
      style={{
        width: `${size.width}px`,
        height: `${size.height}px`,
        transform: `rotate(${tilt}deg)`
      }}
    />
  );
}
