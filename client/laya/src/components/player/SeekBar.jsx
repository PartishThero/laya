// components/player/SeekBar.jsx
import React from 'react';
import { formatDuration } from '../../utils/format.js';

export function SeekBar({ currentTime, duration, onSeek }) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleChange = (e) => {
    const val = parseFloat(e.target.value);
    onSeek((val / 100) * duration);
  };

  return (
    <div className="flex items-center gap-2 w-full select-none">
      <span className="text-[10px] font-mono text-ink-soft w-8 text-right tabular-nums">
        {formatDuration(currentTime)}
      </span>

      <div className="relative flex-1 flex items-center group h-4 cursor-pointer">
        {/* Track background */}
        <div className="w-full h-[2px] bg-rule group-hover:h-[4px] rounded-full overflow-hidden transition-all">
          <div
            className="h-full bg-accent transition-[width] duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Input slider */}
        <input
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={isNaN(progress) ? 0 : progress}
          onChange={handleChange}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
        />
      </div>

      <span className="text-[10px] font-mono text-ink-faint w-8 tabular-nums">
        {formatDuration(duration)}
      </span>
    </div>
  );
}
