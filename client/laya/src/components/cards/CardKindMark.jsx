// components/cards/CardKindMark.jsx
import React from 'react';

export function CardKindMark({ kind, meta = {}, className = '' }) {
  if (kind === 'album') {
    return (
      <span
        className={`inline-flex items-center gap-1 text-[9px] font-mono tracking-widest uppercase text-ink-soft bg-paper/90 px-1.5 py-0.5 rounded-sm border border-rule/40 ${className}`}
        title={`${meta.trackCount || 0} tracks`}
      >
        <span className="w-1.5 h-1.5 rounded-full border border-ink-soft inline-block" />
        {meta.trackCount ? `${meta.trackCount} TRK` : 'ALBUM'}
      </span>
    );
  }

  if (kind === 'playlist') {
    return (
      <span
        className={`inline-flex items-center gap-1 text-[9px] font-mono tracking-widest uppercase text-ink-soft bg-paper/90 px-1.5 py-0.5 rounded-sm border border-rule/40 ${className}`}
        title={`${meta.trackCount || 0} tracks`}
      >
        <span className="inline-block flex flex-col gap-0.5 w-2">
          <span className="w-2 h-[1px] bg-ink-soft" />
          <span className="w-1.5 h-[1px] bg-ink-soft" />
          <span className="w-1 h-[1px] bg-ink-soft" />
        </span>
        {meta.trackCount ? `${meta.trackCount} TRK` : 'PLAYLIST'}
      </span>
    );
  }

  // Song
  return (
    <span
      className={`inline-flex items-center text-[9px] font-mono tracking-widest uppercase text-ink-faint ${className}`}
    >
      <span className="w-1 h-1 rounded-full bg-ink-soft/40" />
    </span>
  );
}
