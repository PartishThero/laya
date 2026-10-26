// components/cards/PlaylistCard.jsx
import React from 'react';
import { CardArt } from './CardArt.jsx';
import { CardKindMark } from './CardKindMark.jsx';

export const PlaylistCard = React.memo(function PlaylistCard({ card, isPlaying = false }) {
  return (
    <div className="w-[210px] h-[170px] relative flex flex-col justify-between bg-paper-2 border border-rule/40 shadow-[var(--shadow-card)] rounded-lg group overflow-hidden transition-shadow duration-200 hover:shadow-[var(--shadow-lifted)]">
      {/* Folder tab design */}
      <div className="absolute top-0 left-0 right-0 h-4 bg-paper/80 border-b border-rule/30 flex items-center px-2.5">
        <span className="w-1.5 h-1.5 rounded-full bg-accent/40 mr-1.5" />
        <span className="text-[9px] font-mono uppercase tracking-wider text-ink-faint">
          FOLDER / {card.meta?.trackCount || 0} ITEMS
        </span>
      </div>

      {/* Main card body */}
      <div className="pt-6 p-3 flex items-center gap-3">
        <div className="w-16 h-16 shrink-0 rounded-md overflow-hidden border border-rule/20 shadow-sm">
          <CardArt card={card} className="w-full h-full" />
        </div>
        <div className="flex-1 overflow-hidden">
          <h3 
            className={`font-serif text-[14px] font-medium leading-tight truncate transition-colors duration-200 ${
              isPlaying ? 'text-accent' : 'text-ink group-hover:text-accent'
            }`}
            title={card.title}
          >
            {card.title}
          </h3>
          <p className="font-sans text-[11px] text-ink-faint truncate mt-0.5">
            By {card.subtitle}
          </p>
        </div>
      </div>

      {/* Footer bar */}
      <div className="px-3 py-2 border-t border-rule/20 bg-paper/40 flex items-center justify-between text-[10px] font-mono text-ink-faint">
        <CardKindMark kind="playlist" meta={card.meta} />
        <span className="italic font-serif text-[11px] text-ink-soft opacity-0 group-hover:opacity-100 transition-opacity duration-200">Click to play</span>
      </div>
    </div>
  );
});
