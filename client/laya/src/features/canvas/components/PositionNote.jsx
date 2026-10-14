// components/canvas/PositionNote.jsx
import React from 'react';

export function PositionNote({ viewport }) {
  // Approximate coordinate chunk numbers for editorial feel
  const normX = Math.round(-viewport.x / 140);
  const normY = Math.round(-viewport.y / 140);

  return (
    <div className="font-mono text-[11px] text-ink-soft select-none tracking-tight flex items-center gap-1.5 bg-paper/80 backdrop-blur-xs px-2.5 py-1 rounded-sm border border-rule/40 shadow-xs">
      <span>x {normX}</span>
      <span className="text-rule-strong">·</span>
      <span>y {normY}</span>
      <span className="text-rule-strong">·</span>
      <span>{Math.round(viewport.scale * 100)}%</span>
    </div>
  );
}
