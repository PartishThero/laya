// hooks/useChunkCards.js
import { useState, useEffect, useRef } from 'react';
import { chunkCoordToSpiralIndex } from '@/features/canvas/engines/spiral.js';
import { placeCardsInChunk } from '@/features/canvas/engines/placement.js';
import { catalogueApi } from '@/services/api/catalogue.api.js';
import { playlistsApi } from '@/services/api/playlists.api.js';
import { toCard } from '@/models/card.model.js';

export function useChunkCards(visibleChunks, mode = 'home') {
  const [chunks, setChunks] = useState(new Map());
  const [loadingChunks, setLoadingChunks] = useState(new Set());
  const chunkCache = useRef(new Map()); // key -> placedCards
  const inFlightRef = useRef(new Set()); // key -> boolean
  const sharedPlaylistsPromiseRef = useRef(null);

  useEffect(() => {
    // Check if mode changed; if so, clear cache and reset in-flight
    chunkCache.current.clear();
    inFlightRef.current.clear();
    sharedPlaylistsPromiseRef.current = null;
    setChunks(new Map());
  }, [mode]);

  useEffect(() => {
    const toFetch = [];

    for (const { cx, cy, key } of visibleChunks) {
      if (!chunkCache.current.has(key) && !inFlightRef.current.has(key)) {
        toFetch.push({ cx, cy, key });
        inFlightRef.current.add(key);
      }
    }

    if (toFetch.length === 0) {
      // Just sync visible chunks from cache
      const nextMap = new Map();
      for (const { key } of visibleChunks) {
        if (chunkCache.current.has(key)) {
          nextMap.set(key, chunkCache.current.get(key));
        }
      }
      setChunks(prev => {
        if (nextMap.size !== prev.size) return nextMap;
        for (const [k, v] of nextMap.entries()) {
          if (prev.get(k) !== v) return nextMap;
        }
        return prev;
      });
      return;
    }

    // Mark loading
    setLoadingChunks(prev => {
      const next = new Set(prev);
      toFetch.forEach(item => next.add(item.key));
      return next;
    });

    const promises = toFetch.map(async ({ cx, cy, key }) => {
      const page = chunkCoordToSpiralIndex(cx, cy);

      try {
        let rawCards = [];

        if (mode === 'playlists') {
          if (!sharedPlaylistsPromiseRef.current) {
            sharedPlaylistsPromiseRef.current = playlistsApi.getPublicPlaylists().catch(err => {
              sharedPlaylistsPromiseRef.current = null;
              throw err;
            });
          }
          const playlists = await sharedPlaylistsPromiseRef.current;
          rawCards = (playlists || []).map(p => toCard(p, 'playlist'));
        } else {
          const kindsParam = mode === 'songs' ? 'song' : mode === 'albums' ? 'album' : 'song,album';
          const res = await catalogueApi.getDiscover({ kinds: kindsParam, page, limit: 9 });

          const songs = (res.songs || []).map(s => toCard(s, 'song'));
          const albums = (res.albums || []).map(a => toCard(a, 'album'));
          const playlists = (res.playlists || []).map(p => toCard(p, 'playlist'));

          if (mode === 'songs') {
            rawCards = songs;
          } else if (mode === 'albums') {
            rawCards = albums;
          } else {
            // Home: interleaved songs and albums
            const interleaved = [];
            const maxLen = Math.max(songs.length, albums.length);
            for (let i = 0; i < maxLen; i++) {
              if (songs[i]) interleaved.push(songs[i]);
              if (albums[i]) interleaved.push(albums[i]);
            }
            rawCards = interleaved.length > 0 ? interleaved : [...songs, ...albums, ...playlists];
          }
        }

        // Deterministic placement
        const placed = placeCardsInChunk(rawCards, cx, cy);
        chunkCache.current.set(key, placed);
        return { key, placed };
      } catch (err) {
        console.error(`Failed to load chunk ${key}:`, err);
        chunkCache.current.set(key, []);
        return { key, placed: [] };
      } finally {
        inFlightRef.current.delete(key);
      }
    });

    Promise.all(promises).then(results => {
      setChunks(prev => {
        const next = new Map(prev);
        results.forEach(r => next.set(r.key, r.placed));
        return next;
      });

      setLoadingChunks(prev => {
        const next = new Set(prev);
        toFetch.forEach(item => next.delete(item.key));
        return next;
      });
    });
  }, [visibleChunks, mode]);

  return { chunks, loadingChunks };
}
