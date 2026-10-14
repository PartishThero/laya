// components/player/VolumeControl.jsx
import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export function VolumeControl({ volume, isMuted, onVolumeChange, onToggleMute }) {
  return (
    <div className="flex items-center gap-2 select-none">
      <button
        onClick={onToggleMute}
        className="text-ink-soft hover:text-ink cursor-pointer p-1"
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted || volume === 0 ? (
          <VolumeX className="w-3.5 h-3.5" />
        ) : (
          <Volume2 className="w-3.5 h-3.5" />
        )}
      </button>

      <div className="relative w-16 flex items-center group h-4 cursor-pointer">
        <div className="w-full h-[2px] bg-rule group-hover:h-[4px] rounded-full overflow-hidden transition-all">
          <div
            className="h-full bg-ink-soft group-hover:bg-accent"
            style={{ width: `${isMuted ? 0 : volume * 100}%` }}
          />
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}
