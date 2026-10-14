// components/canvas/ReturnHome.jsx
import React from 'react';

export function ReturnHome({ onClick, isOffset }) {
  if (!isOffset) return null;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono text-ink bg-paper border border-rule hover:border-accent hover:text-accent shadow-xs rounded-sm transition-colors cursor-pointer select-none"
      title="Glide back to origin (Key: H)"
    >
      <span className="font-serif italic">Return home</span>
      <kbd className="px-1 py-0.2 bg-paper-2 border border-rule/50 rounded-xs text-[9px] text-ink-soft">
        H
      </kbd>
    </button>
  );
}
