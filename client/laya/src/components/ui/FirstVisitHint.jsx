// components/feedback/FirstVisitHint.jsx
import React from 'react';
import { usePrefs } from '@/app/providers/PrefsContext.jsx';
import { Hand, Music, ArrowDown } from 'lucide-react';

export function FirstVisitHint() {
  const { hintDismissed, dismissHint } = usePrefs();

  if (hintDismissed) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] max-w-lg w-11/12 bg-paper/95 backdrop-blur-md border border-rule/80 rounded-sm shadow-xl p-3.5 select-none animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <p className="font-serif italic text-sm text-ink leading-snug">
            Welcome to your table.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-ink-soft">
            <span className="flex items-center gap-1">
              <Hand className="w-3 h-3 text-accent" /> Drag empty space to pan
            </span>
            <span className="flex items-center gap-1">
              <Music className="w-3 h-3 text-accent" /> Click to listen
            </span>
            <span className="flex items-center gap-1">
              <ArrowDown className="w-3 h-3 text-accent" /> Drag cards down to queue or save
            </span>
          </div>
        </div>

        <button
          onClick={dismissHint}
          className="text-xs font-mono text-ink-soft hover:text-ink px-2 py-0.5 border border-rule/40 rounded-xs bg-paper-2/60 cursor-pointer"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
