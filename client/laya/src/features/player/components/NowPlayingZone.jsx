// components/zones/NowPlayingZone.jsx
import React, { useState } from 'react';
import { usePlayer, usePlaybackTime } from '@/features/player/context/PlayerContext.jsx';
import { useDropZone } from '@/hooks/useDropZone.js';
import { CardArt } from '@/components/cards/CardArt.jsx';
import { QueuePile } from '@/features/player/components/QueuePile.jsx';
import { SeekBar } from '@/features/player/components/SeekBar.jsx';
import { VolumeControl } from '@/features/player/components/VolumeControl.jsx';
import { Play, Pause, SkipForward, SkipBack, ChevronDown, ChevronUp } from 'lucide-react';

export function NowPlayingZone() {
  const {
    currentTrack,
    isPlaying,
    duration,
    volume,
    isMuted,
    isLoading,
    togglePlay,
    next,
    prev,
    seek,
    setVolume,
    toggleMute
  } = usePlayer();
  const currentTime = usePlaybackTime();

  const [collapsed, setCollapsed] = useState(false);

  const { zoneRef, isOver, isNear } = useDropZone({
    id: 'now-playing',
    type: 'now-playing'
  });

  return (
    <div
      ref={zoneRef}
      className={`fixed bottom-0 left-0 right-0 z-[200] bg-paper-2/95 backdrop-blur-md border-t transition-all duration-300 select-none ${
        isOver
          ? 'border-accent bg-paper shadow-2xl -translate-y-2'
          : isNear
          ? 'border-accent/60 -translate-y-0.5'
          : 'border-rule shadow-lg'
      }`}
    >
      {/* Visual drop indicator tag when card is near/over */}
      {(isOver || isNear) && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-paper text-[10px] font-mono px-3 py-0.5 rounded-sm shadow-md flex items-center gap-1.5 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-paper" />
          <span>RELEASE TO QUEUE FOR PLAYBACK</span>
        </div>
      )}

      {/* Collapse/Expand mini toggle */}
      <div className="absolute top-1 right-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-ink-soft hover:text-ink p-1 cursor-pointer"
          title={collapsed ? 'Expand player' : 'Collapse player'}
        >
          {collapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* LEFT: Current Track Print */}
        <div className="flex items-center gap-3 w-full md:w-72 overflow-hidden">
          {currentTrack ? (
            <>
              <div className="w-12 h-12 rounded-xs overflow-hidden border border-rule/50 shrink-0 shadow-xs">
                <CardArt card={currentTrack} className="w-full h-full" />
              </div>
              <div className="overflow-hidden">
                <h4 className="font-serif text-[13px] font-medium text-ink truncate leading-tight">
                  {currentTrack.title}
                </h4>
                <p className="font-sans text-[11px] text-ink-soft truncate leading-tight mt-0.5">
                  {currentTrack.subtitle}
                </p>
                <span className="text-[9px] font-mono text-ink-faint tracking-wider uppercase">
                  {currentTrack.kind}
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 text-ink-soft">
              <div className="w-10 h-10 border border-dashed border-rule/80 rounded-xs flex items-center justify-center text-xs font-serif italic bg-paper/30">
                L
              </div>
              <p className="font-serif italic text-xs text-ink-soft">
                Table quiet. Click or drop a card to listen.
              </p>
            </div>
          )}
        </div>

        {/* CENTER: Transport Controls & Seek bar */}
        {!collapsed && (
          <div className="flex-1 max-w-xl w-full flex flex-col items-center gap-1.5">
            {/* Transport buttons */}
            <div className="flex items-center gap-5">
              <button
                onClick={prev}
                className="text-ink-soft hover:text-ink cursor-pointer p-1 transition-colors"
                title="Previous track"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={togglePlay}
                disabled={isLoading}
                className="w-8 h-8 rounded-full bg-ink text-paper hover:bg-accent flex items-center justify-center cursor-pointer transition-colors shadow-xs"
                title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              >
                {isPlaying ? (
                  <Pause className="w-3.5 h-3.5 fill-current" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                )}
              </button>

              <button
                onClick={next}
                className="text-ink-soft hover:text-ink cursor-pointer p-1 transition-colors"
                title="Next track"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Seek Bar */}
            <SeekBar
              currentTime={currentTime}
              duration={duration}
              onSeek={seek}
            />
          </div>
        )}

        {/* RIGHT: Volume & Queue Pile */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          {!collapsed && (
            <div className="hidden lg:block">
              <VolumeControl
                volume={volume}
                isMuted={isMuted}
                onVolumeChange={setVolume}
                onToggleMute={toggleMute}
              />
            </div>
          )}

          {/* Queue Pile physical object */}
          <QueuePile isNear={isNear} />
        </div>
      </div>
    </div>
  );
}
