// components/navigation/Wordmark.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export function Wordmark() {
  return (
    <Link to="/" className="flex items-baseline gap-2 select-none group">
      <span className="font-serif italic font-bold text-2xl tracking-tight text-ink group-hover:text-accent transition-colors">
        laya
      </span>
      <span className="hidden sm:inline-block text-[10px] font-mono tracking-widest uppercase text-ink-soft/70 border-l border-rule/60 pl-2">
        analog audio table
      </span>
    </Link>
  );
}
