// components/cards/PlaylistCard.jsx
import React from 'react';
import { CardArt } from './CardArt.jsx';
import { CardKindMark } from './CardKindMark.jsx';

export const PlaylistCard = React.memo(function PlaylistCard({ card, isPlaying = false }) {
  return (
    <div className="w-[210px] h-[170px] relative flex flex-col justify-between bg-paper-2 border border-rule shadow-[0_2px_10px_rgba(0,0,0,0.07)] rounded-sm group overflow-hidden">
      {/* Folder tab design */}
      <div className="absolute top-0 left-0 right-0 h-4 bg-paper border-b border-rule flex items-center px-2">
        <span className="w-1.5 h-1.5 rounded-full bg-ink-soft/40 mr-1.5" />
        <span className="text-[9px] font-mono uppercase tracking-wider text-ink-soft">
          FOLDER / {card.meta?.trackCount || 0} ITEMS
        </span>
      </div>

      {/* Main card body */}
      <div className="pt-6 p-2.5 flex items-center gap-3">
        <div className="w-16 h-16 shrink-0 rounded-xs overflow-hidden border border-rule/40 shadow-xs">
          <CardArt card={card} className="w-full h-full" />
        </div>
        <div className="flex-1 overflow-hidden">
          <h3 
            className={`font-serif text-[14px] font-medium leading-tight truncate ${
              isPlaying ? 'text-accent' : 'text-ink'
            }`}
            title={card.title}
          >
            {card.title}
          </h3>
          <p className="font-sans text-[11px] text-ink-soft truncate mt-0.5">
            By {card.subtitle}
          </p>
        </div>
      </div>

      {/* Footer bar */}
      <div className="px-2.5 py-1.5 border-t border-rule/30 bg-paper/60 flex items-center justify-between text-[10px] font-mono text-ink-faint">
        <CardKindMark kind="playlist" meta={card.meta} />
        <span className="italic font-serif text-[11px] text-ink-soft">Click to play</span>
      </div>
    </div>
  );
});
