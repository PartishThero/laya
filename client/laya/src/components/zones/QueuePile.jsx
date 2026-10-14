// components/zones/QueuePile.jsx
import React, { useState } from 'react';
import { useQueue } from '../../context/QueueContext.jsx';
import { CardArt } from '../cards/CardArt.jsx';
import { QueueFan } from './QueueFan.jsx';

export function QueuePile({ isNear = false }) {
  const { userQueue } = useQueue();
  const [isOpen, setIsOpen] = useState(false);

  const topCards = userQueue.slice(0, 3);
  const remaining = userQueue.length - 3;

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className={`relative flex items-center justify-center w-14 h-16 cursor-pointer select-none transition-transform duration-200 ${
          isNear ? 'scale-110 -translate-y-1' : 'hover:scale-105'
        }`}
        title={`Queue pile: ${userQueue.length} items. Click to expand.`}
      >
        {userQueue.length === 0 ? (
          <div className="w-12 h-14 border border-dashed border-rule/80 rounded-xs flex flex-col items-center justify-center p-1 bg-paper/40">
            <span className="text-[8px] font-mono uppercase text-ink-faint text-center leading-tight">
              PILE EMPTY
            </span>
          </div>
        ) : (
          <div className="relative w-12 h-14">
            {topCards.map((card, idx) => {
              const tilts = [-5, 3, -1];
              const offsets = [idx * 3, idx * -2];
              return (
                <div
                  key={card.id || idx}
                  className="absolute inset-0 rounded-xs border border-rule/60 shadow-xs overflow-hidden bg-paper"
                  style={{
                    transform: `translate(${offsets[0]}px, ${offsets[1]}px) rotate(${tilts[idx % 3]}deg)`,
                    zIndex: idx + 1
                  }}
                >
                  <CardArt card={card} className="w-full h-full" />
                </div>
              );
            })}

            {remaining > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-ink text-paper text-[9px] font-mono px-1 py-0.2 rounded-full z-10 shadow-xs">
                +{remaining}
              </span>
            )}
          </div>
        )}
      </div>

      {isOpen && <QueueFan onClose={() => setIsOpen(false)} />}
    </>
  );
}
