// pages/Album.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { catalogueApi } from '@/services/api/catalogue.api.js';
import { toCard } from '@/models/card.model.js';
import { usePlayer } from '@/features/player/context/PlayerContext.jsx';
import { useQueue } from '@/features/player/context/QueueContext.jsx';
import { useToast } from '@/app/providers/ToastContext.jsx';
import { CardArt } from '@/components/cards/CardArt.jsx';
import { formatTime, formatDate } from '@/lib/time.js';
import { Play, Plus, ArrowLeft, Loader2, Disc3, Clock } from 'lucide-react';

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
      .then(res => setAlbum(res?.album ? { ...res.album, tracks: res.tracks || [] } : res))
      .catch(err => setError(err.message || 'Album not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="w-full h-full pt-32 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
        <span className="text-xs font-mono text-ink-faint">Loading album…</span>
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="w-full h-full pt-32 flex flex-col items-center justify-center gap-2">
        <Disc3 className="w-10 h-10 text-ink-faint opacity-40" />
        <p className="font-serif italic text-lg text-ink-soft">That album wasn't found.</p>
        <Link to="/albums" className="font-mono text-xs text-accent hover:underline mt-2">
          Return to Albums
        </Link>
      </div>
    );
  }

  const albumCard = toCard(album, 'album');
  const trackCards = (album.tracks || []).map(t => toCard(t, 'song'));

  const totalDuration = trackCards.reduce((sum, t) => sum + (t.meta?.duration || 0), 0);

  const handlePlayAll = () => {
    if (trackCards.length > 0) {
      setContext(trackCards, 0);
      playTrackDirect(trackCards[0]);
    }
  };

  return (
    <div className="w-full h-full pt-20 pb-32 px-6 max-w-4xl mx-auto overflow-y-auto">
      {/* Back link */}
      <div className="page-enter">
        <Link
          to="/albums"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-faint hover:text-ink transition-colors duration-200 mb-8 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>All Albums</span>
        </Link>
      </div>

      {/* Album Hero */}
      <div className="page-enter flex flex-col md:flex-row gap-8 items-start pb-8 mb-10">
        {/* Cover artwork with shadow */}
        <div className="w-56 h-56 rounded-lg overflow-hidden shrink-0 shadow-xl ring-1 ring-rule/20">
          <CardArt card={albumCard} className="w-full h-full" />
        </div>

        {/* Metadata & Actions */}
        <div className="flex-1 page-enter-delayed">
          <span className="stat-badge mb-3">
            ALBUM SLEEVE
          </span>

          <h1 className="font-serif text-3xl md:text-4xl font-bold text-ink mt-2 tracking-tight">
            {album.title}
          </h1>

          <p className="font-sans text-sm text-ink-soft mt-2">
            By <span className="font-medium text-ink">{album.artist?.name || 'Artist'}</span>
            {album.releaseDate && ` · ${formatDate(album.releaseDate)}`}
          </p>

          <p className="font-serif italic text-sm text-ink-soft mt-3 max-w-lg leading-relaxed">
            {album.description || 'Master recording preserved in the Laya archive.'}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-3 mt-4">
            <span className="stat-badge">
              <Disc3 className="w-3 h-3" />
              {trackCards.length} tracks
            </span>
            {totalDuration > 0 && (
              <span className="stat-badge">
                <Clock className="w-3 h-3" />
                {formatTime(totalDuration)}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-6">
            <button onClick={handlePlayAll} className="btn-primary">
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play Record</span>
            </button>
            <button
              onClick={() => {
                queueCard(trackCards);
                addToast(`Queued ${trackCards.length} tracks`, 'info');
              }}
              className="btn-secondary"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Queue All</span>
            </button>
          </div>
        </div>
      </div>

      {/* Accent divider */}
      <div className="accent-line mb-8" />

      {/* Ordered Track List */}
      <div className="page-enter-delayed stagger-2">
        <h2 className="section-header font-serif text-lg font-medium text-ink mb-5">
          Tracklist ({trackCards.length})
        </h2>

        <div className="rounded-lg border border-rule/40 overflow-hidden bg-paper-2/30">
          {trackCards.map((track, idx) => (
            <div
              key={track.id}
              className={`track-row group ${idx < trackCards.length - 1 ? 'border-b border-rule/20' : ''}`}
              style={{ margin: 0, borderRadius: 0 }}
            >
              <div
                className="flex items-center gap-4 flex-1 cursor-pointer overflow-hidden"
                onClick={() => {
                  setContext(trackCards, idx);
                  playTrackDirect(track);
                }}
              >
                <span className="font-mono text-xs text-ink-faint w-6 text-right tabular-nums">
                  {idx + 1}
                </span>
                <span className="font-serif text-sm font-medium text-ink truncate group-hover:text-accent transition-colors">
                  {track.title}
                </span>
              </div>

              <div className="flex items-center gap-4 pl-4">
                <span className="font-mono text-xs text-ink-faint tabular-nums">
                  {formatTime(track.meta?.duration)}
                </span>
                <button
                  onClick={() => {
                    queueCard(track);
                    addToast(`Queued "${track.title}"`, 'info');
                  }}
                  className="text-ink-faint hover:text-accent text-[11px] font-mono p-1 cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-200"
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
