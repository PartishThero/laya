// components/zones/ZoneStamp.jsx
import React from 'react';

export function ZoneStamp({ status = 'idle', className = '' }) {
  if (status === 'idle') return null;

  if (status === 'pending') {
    return (
      <div className={`inline-flex items-center gap-1.5 text-[10px] font-mono text-accent bg-paper px-2 py-0.5 border border-accent/40 rounded-sm animate-pulse ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
        <span>SAVING TO ARCHIVE...</span>
      </div>
    );
  }

  if (status === 'confirmed') {
    return (
      <div className={`inline-flex items-center gap-1.5 text-[10px] font-mono text-success bg-paper px-2 py-0.5 border border-success/40 rounded-sm ${className}`}>
        <span className="font-serif italic text-xs font-bold">✓</span>
        <span>STAMPED</span>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className={`inline-flex items-center gap-1.5 text-[10px] font-mono text-danger bg-paper px-2 py-0.5 border border-danger/40 rounded-sm animate-bounce ${className}`}>
        <span>✕</span>
        <span>FAILED</span>
      </div>
    );
  }

  return null;
}
