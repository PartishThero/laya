// pages/Album.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { catalogueApi } from '../services/api/catalogue.api.js';
import { toCard } from '../models/card.model.js';
import { usePlayer } from '../context/PlayerContext.jsx';
import { useQueue } from '../context/QueueContext.jsx';
import { useToast } from '@/app/providers/ToastContext.jsx';
import { CardArt } from '../components/cards/CardArt.jsx';
import { formatDuration, formatDate } from '@/lib/time.js';
import { Play, Plus, ArrowLeft, Loader2 } from 'lucide-react';

export default function Album() {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { playTrackDirect, setContext } = usePlayer();
  const { queueCard } = useQueue();
  const { addToast } = useToast();

  useEffect(() => {
    catalogueApi.getAlbum(id)
      .then(setAlbum)
      .catch(err => setError(err.message || 'Album not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="w-full h-full pt-32 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="w-full h-full pt-32 text-center">
        <p className="font-serif italic text-lg text-ink-soft">That album wasn't found.</p>
        <Link to="/albums" className="font-mono text-xs text-accent mt-2 inline-block">
          Return to Albums
        </Link>
      </div>
    );
  }

  const albumCard = toCard(album, 'album');
  const trackCards = (album.tracks || []).map(t => toCard(t, 'song'));

  const handlePlayAll = () => {
    if (trackCards.length > 0) {
      setContext(trackCards, 0);
      playTrackDirect(trackCards[0]);
    }
  };

  return (
    <div className="w-full h-full pt-20 pb-32 px-6 max-w-4xl mx-auto overflow-y-auto">
      <Link
        to="/albums"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-soft hover:text-ink mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>All Albums</span>
      </Link>

      <div className="flex flex-col md:flex-row gap-8 items-start border-b border-rule pb-8 mb-8">
        {/* Cover artwork */}
        <div className="w-56 h-56 rounded-sm overflow-hidden border border-rule shadow-xl shrink-0">
          <CardArt card={albumCard} className="w-full h-full" />
        </div>

        {/* Metadata & Actions */}
        <div className="flex-1">
          <span className="text-[10px] font-mono tracking-widest uppercase text-ink-soft bg-paper-2 px-2 py-0.5 rounded-xs border border-rule/50">
            ALBUM SLEEVE
          </span>

          <h1 className="font-serif text-3xl md:text-4xl font-bold text-ink mt-2">
            {album.title}
          </h1>

          <p className="font-sans text-sm text-ink-soft mt-1">
            By <span className="font-medium text-ink">{album.artist?.name || 'Artist'}</span>
            {album.releaseDate && ` · ${formatDate(album.releaseDate)}`}
          </p>

          <p className="font-serif italic text-sm text-ink-soft mt-3 max-w-lg">
            {album.description || 'Master recording preserved in the Laya archive.'}
          </p>

          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={handlePlayAll}
              className="px-4 py-2 bg-ink text-paper rounded-xs font-mono text-xs hover:bg-accent transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play Record</span>
            </button>
            <button
              onClick={() => {
                queueCard(trackCards);
                addToast(`Queued ${trackCards.length} tracks`, 'info');
              }}
              className="px-4 py-2 bg-paper-2 border border-rule rounded-xs font-mono text-xs hover:border-accent transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Queue All</span>
            </button>
          </div>
        </div>
      </div>

      {/* Ordered Track List */}
      <div>
        <h2 className="font-serif text-lg font-medium text-ink mb-4">
          Tracklist ({trackCards.length})
        </h2>

        <div className="divide-y divide-rule/40 border border-rule/50 rounded-xs bg-paper-2/40">
          {trackCards.map((track, idx) => (
            <div
              key={track.id}
              className="flex items-center justify-between p-3 hover:bg-paper-2 transition-colors group"
            >
              <div
                className="flex items-center gap-4 flex-1 cursor-pointer overflow-hidden"
                onClick={() => {
                  setContext(trackCards, idx);
                  playTrackDirect(track);
                }}
              >
                <span className="font-mono text-xs text-ink-faint w-5 text-right">
                  {idx + 1}
                </span>
                <span className="font-serif text-sm font-medium text-ink truncate group-hover:text-accent">
                  {track.title}
                </span>
              </div>

              <div className="flex items-center gap-4 pl-4">
                <span className="font-mono text-xs text-ink-faint">
                  {formatDuration(track.meta?.duration)}
                </span>
                <button
                  onClick={() => {
                    queueCard(track);
                    addToast(`Queued "${track.title}"`, 'info');
                  }}
                  className="text-ink-soft hover:text-ink text-xs font-mono p-1 cursor-pointer"
                  title="Queue track"
                >
                  + Queue
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
