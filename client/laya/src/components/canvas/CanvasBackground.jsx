// components/canvas/CanvasBackground.jsx
import React from 'react';

export function CanvasBackground({ viewport }) {
  // Pattern offset moving with viewport
  const bgSize = 80 * viewport.scale;
  const offsetX = viewport.x % bgSize;
  const offsetY = viewport.y % bgSize;

  return (
    <div
      className="absolute inset-0 pointer-events-none select-none overflow-hidden"
      style={{
        backgroundImage: `
          radial-gradient(circle, var(--rule) 1px, transparent 1px)
        `,
        backgroundSize: `${bgSize}px ${bgSize}px`,
        backgroundPosition: `${offsetX}px ${offsetY}px`,
        opacity: 0.65
      }}
    />
  );
}
