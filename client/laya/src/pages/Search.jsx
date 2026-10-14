// pages/Search.jsx
import React, { useState, useEffect } from 'react';
import { searchApi } from '../services/api/search.api.js';
import { toCard } from '../models/card.model.js';
import { Card } from '../components/cards/Card.jsx';
import { usePlayer } from '../context/PlayerContext.jsx';
import { Search as SearchIcon, Loader2 } from 'lucide-react';

export default function Search() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ songs: [], albums: [], artists: [] });
  const [error, setError] = useState(null);
  const { playCard } = usePlayer();

  useEffect(() => {
    if (!query.trim()) {
      setResults({ songs: [], albums: [], artists: [] });
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await searchApi.searchAll(query.trim());
        const songs = (res.songs || []).map(s => toCard(s, 'song'));
        const albums = (res.albums || []).map(a => toCard(a, 'album'));
        setResults({ songs, albums, artists: res.artists || [] });
      } catch (err) {
        setError(err.message || 'Search request failed');
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  const allResultCards = [...results.songs, ...results.albums];

  return (
    <div className="w-full h-full pt-20 pb-32 px-6 max-w-6xl mx-auto overflow-y-auto">
      {/* Search Input Field */}
      <div className="max-w-xl mx-auto mb-10 text-center">
        <h1 className="font-serif italic text-3xl text-ink mb-2">
          Search the archive
        </h1>
        <p className="text-xs font-mono text-ink-soft mb-6">
          Find songs, albums, and artists across the collection.
        </p>

        <div className="relative flex items-center">
          <SearchIcon className="absolute left-4 w-4 h-4 text-ink-soft" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a title, artist, or keyword..."
            autoFocus
            className="w-full pl-11 pr-4 py-3 bg-paper-2 border border-rule rounded-sm text-sm font-serif text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-ink-soft/60"
          />
          {loading && (
            <Loader2 className="absolute right-4 w-4 h-4 text-accent animate-spin" />
          )}
        </div>
      </div>

      {/* Results Display */}
      {error && (
        <div className="text-center py-12">
          <p className="font-serif italic text-danger text-base">
            Search request failed.
          </p>
          <p className="text-xs font-mono text-ink-soft mt-1">{error}</p>
        </div>
      )}

      {!loading && query && allResultCards.length === 0 && !error && (
        <div className="text-center py-16">
          <p className="font-serif italic text-lg text-ink-soft">
            Nothing by that name yet.
          </p>
          <p className="text-xs font-mono text-ink-faint mt-1">
            Try searching for "ambient", "coffee", "canyon", or an artist.
          </p>
        </div>
      )}

      {allResultCards.length > 0 && (
        <div className="space-y-8">
          {/* Songs matching */}
          {results.songs.length > 0 && (
            <div>
              <h2 className="font-serif text-base font-medium text-ink border-b border-rule pb-2 mb-4">
                Songs ({results.songs.length})
              </h2>
              <div className="flex flex-wrap gap-6">
                {results.songs.map((card, idx) => (
                  <Card
                    key={card.id}
                    card={card}
                    tilt={(idx % 2 === 0 ? 1 : -1) * 1.5}
                    onClick={() => playCard(card, results.songs)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Albums matching */}
          {results.albums.length > 0 && (
            <div>
              <h2 className="font-serif text-base font-medium text-ink border-b border-rule pb-2 mb-4">
                Albums ({results.albums.length})
              </h2>
              <div className="flex flex-wrap gap-6">
                {results.albums.map((card, idx) => (
                  <Card
                    key={card.id}
                    card={card}
                    tilt={(idx % 2 === 0 ? -1 : 1) * 2}
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
