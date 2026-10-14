// components/zones/QueueFan.jsx
import React from 'react';
import { useQueue } from '@/features/player/context/QueueContext.jsx';
import { usePlayer } from '@/features/player/context/PlayerContext.jsx';
import { CardArt } from '@/components/cards/CardArt.jsx';
import { formatDuration } from '@/lib/time.js';

export function QueueFan({ onClose }) {
  const { userQueue, removeFromQueue, clearUserQueue } = useQueue();
  const { playTrackDirect } = usePlayer();

  return (
    <div
      className="fixed inset-0 z-[1050] bg-ink/20 backdrop-blur-xs flex justify-end"
      onClick={onClose}
    >
      <div
        className="w-80 md:w-96 bg-paper h-full border-l border-rule shadow-2xl p-6 flex flex-col justify-between"
        onClick={e => e.stopPropagation()}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-rule pb-4 mb-4">
            <div>
              <h2 className="font-serif text-lg font-medium text-ink">Queue Pile</h2>
              <p className="text-xs font-mono text-ink-soft">
                {userQueue.length} {userQueue.length === 1 ? 'item' : 'items'} awaiting playback
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-ink-soft hover:text-ink text-lg font-mono p-1 cursor-pointer"
            >
              ×
            </button>
          </div>

          {/* List of queued tracks */}
          <div className="overflow-y-auto max-h-[calc(100vh-220px)] space-y-2 pr-1">
            {userQueue.length === 0 ? (
              <div className="py-12 text-center">
                <p className="font-serif italic text-ink-soft text-sm">
                  The pile is empty.
                </p>
                <p className="text-xs font-mono text-ink-faint mt-1">
                  Drag any card down to the player to stack it here.
                </p>
              </div>
            ) : (
              userQueue.map((card, idx) => (
                <div
                  key={card.id || idx}
                  className="flex items-center justify-between p-2 rounded-xs border border-rule/40 bg-paper-2/40 hover:bg-paper-2 transition-colors group"
                >
                  <div
                    className="flex items-center gap-3 flex-1 overflow-hidden cursor-pointer"
                    onClick={() => {
                      playTrackDirect(card);
                      removeFromQueue(idx);
                    }}
                  >
                    <div className="w-9 h-9 rounded-xs overflow-hidden shrink-0 border border-rule/30">
                      <CardArt card={card} className="w-full h-full" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-serif text-xs font-medium text-ink truncate group-hover:text-accent">
                        {card.title}
                      </p>
                      <p className="text-[10px] text-ink-soft font-sans truncate">
                        {card.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-2">
                    {card.meta?.duration > 0 && (
                      <span className="text-[10px] font-mono text-ink-faint">
                        {formatDuration(card.meta.duration)}
                      </span>
                    )}
                    <button
                      onClick={() => removeFromQueue(idx)}
                      className="text-ink-soft hover:text-danger text-xs p-1 cursor-pointer"
                      title="Remove from queue"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer actions */}
        {userQueue.length > 0 && (
          <div className="pt-4 border-t border-rule flex justify-between items-center">
            <button
              onClick={clearUserQueue}
              className="text-xs font-mono text-ink-soft hover:text-danger cursor-pointer"
            >
              Clear pile
            </button>
            <span className="text-[10px] font-mono text-ink-faint">
              User-queued items play next
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
