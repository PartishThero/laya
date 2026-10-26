// pages/Search.jsx
import React, { useState, useEffect } from 'react';
import { searchApi } from '@/services/api/search.api.js';
import { toCard } from '@/models/card.model.js';
import { Card } from '@/components/cards/Card.jsx';
import { usePlayerActions } from '@/features/player/context/PlayerContext.jsx';
import { Search as SearchIcon, Loader2, Music, Disc3 } from 'lucide-react';

export default function Search() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ songs: [], albums: [], artists: [] });
  const [error, setError] = useState(null);
  const { playCard } = usePlayerActions();

  useEffect(() => {
    if (!query.trim()) {
      setResults({ songs: [], albums: [], artists: [] });
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await searchApi.searchAll(query.trim(), { signal: controller.signal });
        if (controller.signal.aborted) return;
        const songs = (res.songs || []).map(s => toCard(s, 'song'));
        const albums = (res.albums || []).map(a => toCard(a, 'album'));
        setResults({ songs, albums, artists: res.artists || [] });
      } catch (err) {
        if (controller.signal.aborted || err.name === 'AbortError') {
          return;
        }
        setError(err.message || 'Search request failed');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 280);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const allResultCards = [...results.songs, ...results.albums];

  return (
    <div className="w-full h-full pt-20 pb-32 px-6 max-w-6xl mx-auto overflow-y-auto">
      {/* Search Input Field */}
      <div className="max-w-xl mx-auto mb-12 text-center page-enter">
        <div className="accent-line mx-auto mb-5" />
        <h1 className="font-serif italic text-3xl text-ink tracking-tight mb-2">
          Search the archive
        </h1>
        <p className="text-xs font-mono text-ink-faint mb-8">
          Find songs, albums, and artists across the collection.
        </p>

        <div className="relative flex items-center">
          <SearchIcon className="absolute left-4 w-4 h-4 text-ink-faint" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a title, artist, or keyword..."
            autoFocus
            className="input-premium !pl-11 !pr-10"
          />
          {loading && (
            <Loader2 className="absolute right-4 w-4 h-4 text-accent animate-spin" />
          )}
        </div>
      </div>

      {/* Results Display */}
      {error && (
        <div className="text-center py-12 page-enter">
          <p className="font-serif italic text-danger text-base">
            Search request failed.
          </p>
          <p className="text-xs font-mono text-ink-faint mt-1.5">{error}</p>
        </div>
      )}

      {!loading && query && allResultCards.length === 0 && !error && (
        <div className="empty-state page-enter">
          <SearchIcon className="empty-state-icon" />
          <p className="font-serif italic text-lg text-ink-soft">
            Nothing by that name yet.
          </p>
          <p className="text-xs font-mono text-ink-faint mt-1.5 max-w-xs">
            Try searching for "ambient", "coffee", "canyon", or an artist name.
          </p>
        </div>
      )}

      {allResultCards.length > 0 && (
        <div className="space-y-10 page-enter-delayed">
          {/* Songs matching */}
          {results.songs.length > 0 && (
            <div>
              <h2 className="section-header font-serif text-base font-medium text-ink mb-5">
                <Music className="w-4 h-4 text-ink-soft" />
                Songs ({results.songs.length})
              </h2>
              <div className="flex flex-wrap gap-6">
                {results.songs.map((card, idx) => (
                  <Card
                    key={card.id}
                    card={card}
                    tilt={0}
                    onClick={() => playCard(card, results.songs)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Albums matching */}
          {results.albums.length > 0 && (
            <div>
              <h2 className="section-header font-serif text-base font-medium text-ink mb-5">
                <Disc3 className="w-4 h-4 text-ink-soft" />
                Albums ({results.albums.length})
              </h2>
              <div className="flex flex-wrap gap-6">
                {results.albums.map((card, idx) => (
                  <Card
                    key={card.id}
                    card={card}
                    tilt={0}
                    onClick={() => playCard(card, results.albums)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
