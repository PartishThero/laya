// components/cards/CardSkeleton.jsx
import React from 'react';
import { cardSize } from '../../models/card.model.js';

export function CardSkeleton({ kind = 'song', tilt = 0 }) {
  const size = cardSize(kind);
  const style = {
    width: `${size.width}px`,
    height: `${size.height}px`,
    transform: `rotate(${tilt}deg)`
  };

  // Song + album cards are square squircles now
  if (kind !== 'playlist') {
    return (
      <div
        className="relative overflow-hidden rounded-[22%] bg-paper/60 border border-rule/50 animate-pulse"
        style={style}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-mono text-ink-faint">PRINT DEVELOPING</span>
        </div>
        <div className="absolute inset-x-0 bottom-[10%] flex flex-col items-center space-y-1.5">
          <div className="h-3 bg-paper-2/80 rounded-xs w-1/2" />
          <div className="h-2 bg-paper-2/50 rounded-xs w-1/3" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="p-2.5 bg-paper/60 border border-rule/50 rounded-sm shadow-xs flex flex-col justify-between animate-pulse"
      style={style}
    >
      <div className="w-full aspect-square bg-paper-2/70 rounded-xs border border-rule/20 flex items-center justify-center">
        <span className="text-[10px] font-mono text-ink-faint">PRINT DEVELOPING</span>
      </div>
      <div className="space-y-1.5 mt-2">
        <div className="h-3 bg-paper-2/80 rounded-xs w-3/4" />
        <div className="h-2 bg-paper-2/50 rounded-xs w-1/2" />
      </div>
    </div>
  );
}
