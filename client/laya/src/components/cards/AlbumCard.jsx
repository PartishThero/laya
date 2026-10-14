// components/cards/AlbumCard.jsx
import React from 'react';
import { VinylCard } from './VinylCard.jsx';
import { usePlaybackTime } from '@/features/player/context/PlayerContext.jsx';

function ActiveAlbumCard({ card, isPaused, duration }) {
  const currentTime = usePlaybackTime();
  return (
    <VinylCard
      card={card}
      isPlaying={true}
      isPaused={isPaused}
      currentTime={currentTime}
      duration={duration}
      className="w-[260px]"
    />
  );
}

// Width here must match cardSize('album') in models/card.model.js (square: 260 x 260).
export const AlbumCard = React.memo(function AlbumCard({
  card,
  isPlaying = false,
  isPaused = false,
  duration
}) {
  const trackDuration = duration ?? card.meta?.duration;

  if (isPlaying) {
    return (
      <ActiveAlbumCard
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
      className="w-[260px]"
    />
  );
});
