// components/cards/SongCard.jsx
import React from 'react';
import { VinylCard } from './VinylCard.jsx';
import { usePlaybackTime } from '@/features/player/context/PlayerContext.jsx';

function ActiveSongCard({ card, isPaused, duration }) {
  const currentTime = usePlaybackTime();
  return (
    <VinylCard
      card={card}
      isPlaying={true}
      isPaused={isPaused}
      currentTime={currentTime}
      duration={duration}
      className="w-[200px]"
    />
  );
}

// Width here must match cardSize('song') in models/card.model.js (square: 200 x 200).
export const SongCard = React.memo(function SongCard({
  card,
  isPlaying = false,
  isPaused = false,
  duration
}) {
  const trackDuration = duration ?? card.meta?.duration;

  if (isPlaying) {
    return (
      <ActiveSongCard
        card={card}
        isPaused={isPaused}
        duration={trackDuration}
      />
    );
  }

  return (
    <VinylCard
      card={card}
      isPlaying={false}
      isPaused={false}
      duration={trackDuration}
      className="w-[200px]"
    />
  );
});
