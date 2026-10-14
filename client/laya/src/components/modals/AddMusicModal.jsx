// components/modals/AddMusicModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAddMusic } from '@/app/providers/AddMusicContext.jsx';
import { useToast } from '@/app/providers/ToastContext.jsx';
import { catalogueApi } from '@/services/api/catalogue.api.js';
import { 
  X, 
  Upload, 
  Music, 
  Link as LinkIcon, 
  Disc, 
  Search, 
  Check, 
  Loader2, 
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';

export function AddMusicModal() {
  const { isOpen, closeAddMusic } = useAddMusic();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'url' | 'spotify'
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form states for manual / file upload
  const [title, setTitle] = useState('');
  const [artistName, setArtistName] = useState('');
  const [albumTitle, setAlbumTitle] = useState('');
  const [genre, setGenre] = useState('Vinyl');
  const [duration, setDuration] = useState(180);
  const [audioUrl, setAudioUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');

  // File upload specific
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');

  // Spotify search state
  const [spotifyQuery, setSpotifyQuery] = useState('');
  const [spotifyResults, setSpotifyResults] = useState([]);
  const [spotifyLoading, setSpotifyLoading] = useState(false);
  const [spotifyConfigured, setSpotifyConfigured] = useState(true);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSubmitting(false);
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        closeAddMusic();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeAddMusic]);

  // Extract duration from selected audio file
  const handleAudioFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAudioFile(file);
    if (!title) {
      // Auto-extract title from file name
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(cleanName);
    }

    try {
      const objectUrl = URL.createObjectURL(file);
      const audio = new Audio();
      audio.src = objectUrl;
      audio.addEventListener('loadedmetadata', () => {
        if (audio.duration && !isNaN(audio.duration)) {
          setDuration(Math.round(audio.duration));
        }
        URL.revokeObjectURL(objectUrl);
      });
    } catch {
      // Fallback
    }
  };

  // Preview cover image
  const handleCoverFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCoverFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setCoverPreview(event.target?.result);
    };
    reader.readAsDataURL(file);
  };

  // Debounced Spotify Search
  useEffect(() => {
    if (activeTab !== 'spotify' || !spotifyQuery.trim()) {
      setSpotifyResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSpotifyLoading(true);
      setError(null);
      try {
        const res = await catalogueApi.searchSpotify(spotifyQuery.trim());
        setSpotifyConfigured(res?.configured ?? true);
        setSpotifyResults(res?.tracks || []);
      } catch (err) {
        console.warn('Spotify search failed:', err);
      } finally {
        setSpotifyLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [spotifyQuery, activeTab]);

  // Import a track from Spotify results
  const handleImportSpotifyTrack = async (track) => {
    setSubmitting(true);
    setError(null);

    try {
      // Spotify preview audio if available, or fall back to high quality preview stream
      const finalAudio = track.previewUrl || 'https://cdn.freesound.org/previews/612/612089_11861866-lq.mp3';

      const payload = {
        title: track.title,
        artistName: track.artist,
        albumTitle: track.album,
        genre: 'Spotify',
        duration: track.duration || 180,
        audioUrl: finalAudio,
        coverUrl: track.coverUrl
      };

      const newSong = await catalogueApi.createSong(payload);

      // Notify application and canvas
      window.dispatchEvent(new CustomEvent('laya:song-added', { detail: newSong }));
      addToast(`✨ Added "${track.title}" by ${track.artist} to catalogue`, 'success');
      closeAddMusic();
    } catch (err) {
      setError(err.message || 'Failed to import Spotify track');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit manual or file upload form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Track title is required');
      return;
    }

    if (activeTab === 'upload' && !audioFile) {
      setError('Please select an audio file to upload');
      return;
    }

    if (activeTab === 'url' && !audioUrl.trim()) {
      setError('Please enter a valid audio stream URL');
      return;
    }

    setSubmitting(true);

    try {
      let result;
      if (activeTab === 'upload') {
        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('artistName', artistName.trim() || 'Unknown Artist');
        if (albumTitle.trim()) formData.append('albumTitle', albumTitle.trim());
        formData.append('genre', genre.trim() || 'Vinyl');
        formData.append('duration', String(duration));
        formData.append('audioFile', audioFile);
        if (coverFile) formData.append('coverFile', coverFile);

        result = await catalogueApi.createSong(formData);
      } else {
        const payload = {
          title: title.trim(),
          artistName: artistName.trim() || 'Unknown Artist',
          albumTitle: albumTitle.trim() || undefined,
          genre: genre.trim() || 'Vinyl',
          duration: Number(duration) || 180,
          audioUrl: audioUrl.trim(),
          coverUrl: coverUrl.trim() || undefined
        };

        result = await catalogueApi.createSong(payload);
      }

      // Notify application and canvas
      window.dispatchEvent(new CustomEvent('laya:song-added', { detail: result }));
      addToast(`✨ Pressed "${title.trim()}" onto vinyl`, 'success');
      closeAddMusic();
    } catch (err) {
      setError(err.message || 'Failed to add song to catalogue');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[1200] bg-ink/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAddMusic();
      }}
    >
      <div 
        className="relative w-full max-w-xl bg-paper border border-rule shadow-2xl rounded-sm overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between border-b border-rule px-6 py-4 bg-paper select-none">
          <div>
            <span className="font-mono text-[10px] tracking-widest uppercase text-accent font-semibold block">
              Laya Pressing Plant & Archive
            </span>
            <h2 className="font-serif italic text-2xl text-ink leading-tight">
              Add Record to Collection
            </h2>
          </div>

          <button
            onClick={closeAddMusic}
            className="p-1.5 text-ink-soft hover:text-ink hover:bg-rule/40 rounded-xs transition-colors cursor-pointer"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TABS SELECTOR */}
        <div className="flex border-b border-rule bg-paper-tint/30 text-xs font-mono select-none px-6 pt-2">
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-2.5 px-3 border-b-2 font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'upload'
                ? 'border-accent text-accent'
                : 'border-transparent text-ink-soft hover:text-ink'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Audio File</span>
          </button>

          <button
            onClick={() => setActiveTab('spotify')}
            className={`pb-2.5 px-3 border-b-2 font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'spotify'
                ? 'border-accent text-accent'
                : 'border-transparent text-ink-soft hover:text-ink'
            }`}
          >
            <Disc className="w-3.5 h-3.5 text-emerald-600" />
            <span>Spotify Search</span>
          </button>

          <button
            onClick={() => setActiveTab('url')}
            className={`pb-2.5 px-3 border-b-2 font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'url'
                ? 'border-accent text-accent'
                : 'border-transparent text-ink-soft hover:text-ink'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Audio URL / Stream</span>
          </button>
        </div>

        {/* ERROR BANNER */}
        {error && (
          <div className="px-6 py-2.5 bg-danger/10 border-b border-danger/30 text-danger text-xs font-mono flex items-center gap-2">
            <span>⚠</span>
            <span>{error}</span>
          </div>
        )}

        {/* TAB 1: UPLOAD FILE */}
        {activeTab === 'upload' && (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 font-mono text-xs">
            {/* Audio File Input */}
            <div>
              <label className="block text-ink-soft mb-1 text-[11px] uppercase tracking-wider">
                Audio Track File (.mp3, .wav, .m4a, .flac) *
              </label>
              <div className="relative border border-dashed border-rule hover:border-accent/80 transition-colors rounded-sm p-4 text-center cursor-pointer bg-paper hover:bg-paper-tint/20">
                <input
                  type="file"
                  accept="audio/*,.mp3,.wav,.m4a,.aac,.flac,.ogg"
                  onChange={handleAudioFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Music className="w-6 h-6 mx-auto mb-1 text-accent/80" />
                {audioFile ? (
                  <div>
                    <span className="font-semibold text-ink block truncate max-w-sm mx-auto">{audioFile.name}</span>
                    <span className="text-[10px] text-ink-soft">
                      {(audioFile.size / (1024 * 1024)).toFixed(2)} MB • {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="text-ink font-serif italic text-sm block">Click to select or drag audio file here</span>
                    <span className="text-[10px] text-ink-soft">Supports MP3, WAV, FLAC, M4A up to 80MB</span>
                  </div>
                )}
              </div>
            </div>

            {/* Cover Art Upload */}
            <div>
              <label className="block text-ink-soft mb-1 text-[11px] uppercase tracking-wider">
                Record Cover Artwork (Optional)
              </label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xs border border-rule bg-paper-tint/40 flex-shrink-0 overflow-hidden flex items-center justify-center">
                  {coverPreview ? (
                    <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-ink-soft/40" />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverFileChange}
                    className="text-xs text-ink-soft file:mr-3 file:py-1 file:px-3 file:rounded-xs file:border file:border-rule file:text-xs file:font-mono file:bg-paper file:text-ink hover:file:bg-paper-tint/40 cursor-pointer"
                  />
                  <span className="text-[10px] text-ink-soft block mt-1">Leaves as vintage vinyl artwork if omitted.</span>
                </div>
              </div>
            </div>

            {/* Metadata Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-ink-soft mb-1 text-[11px] uppercase tracking-wider">
                  Track Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Instant Crush"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-paper border border-rule rounded-xs text-xs font-mono text-ink focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-ink-soft mb-1 text-[11px] uppercase tracking-wider">
                  Artist Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Daft Punk"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  className="w-full px-3 py-2 bg-paper border border-rule rounded-xs text-xs font-mono text-ink focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-ink-soft mb-1 text-[11px] uppercase tracking-wider">
                  Album Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Random Access Memories"
                  value={albumTitle}
                  onChange={(e) => setAlbumTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-paper border border-rule rounded-xs text-xs font-mono text-ink focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-ink-soft mb-1 text-[11px] uppercase tracking-wider">
                  Genre
                </label>
                <input
                  type="text"
                  placeholder="Vinyl, Electronic, Indie..."
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full px-3 py-2 bg-paper border border-rule rounded-xs text-xs font-mono text-ink focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-rule flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeAddMusic}
                className="px-4 py-2 border border-rule rounded-xs text-ink-soft hover:text-ink cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-ink text-paper rounded-xs hover:bg-accent transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Pressing Record...</span>
                  </>
                ) : (
                  <>
                    <Disc className="w-3.5 h-3.5" />
                    <span>Press & Place on Canvas</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: SPOTIFY SEARCH & IMPORT */}
        {activeTab === 'spotify' && (
          <div className="p-6 overflow-y-auto space-y-4 font-mono text-xs">
            <div>
              <label className="block text-ink-soft mb-1.5 text-[11px] uppercase tracking-wider">
                Live Spotify Web API Search
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-ink-soft" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search any song, artist or album on Spotify..."
                  value={spotifyQuery}
                  onChange={(e) => setSpotifyQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-paper border border-rule rounded-xs text-xs font-mono text-ink focus:outline-none focus:border-accent"
                />
                {spotifyLoading && (
                  <Loader2 className="w-4 h-4 absolute right-3 top-2.5 text-accent animate-spin" />
                )}
              </div>
            </div>

            {/* Results container */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {spotifyResults.length > 0 ? (
                spotifyResults.map(track => (
                  <div
                    key={track.id}
                    className="flex items-center justify-between p-2.5 rounded-sm border border-rule/70 hover:border-accent bg-paper hover:bg-paper-tint/30 transition-all gap-3"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img
                        src={track.coverUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100'}
                        alt={track.title}
                        className="w-11 h-11 rounded-xs object-cover flex-shrink-0 border border-rule/40"
                      />
                      <div className="overflow-hidden">
                        <span className="font-serif italic text-sm text-ink block truncate">
                          {track.title}
                        </span>
                        <span className="text-[11px] text-ink-soft block truncate">
                          {track.artist} • {track.album}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleImportSpotifyTrack(track)}
                      className="px-3 py-1.5 bg-ink text-paper rounded-xs hover:bg-accent transition-colors flex items-center gap-1.5 flex-shrink-0 cursor-pointer disabled:opacity-50 text-[11px]"
                    >
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>Add to Canvas</span>
                    </button>
                  </div>
                ))
              ) : spotifyQuery.trim() && !spotifyLoading ? (
                <div className="text-center py-8 text-ink-soft">
                  <p>No tracks found on Spotify for "{spotifyQuery}".</p>
                </div>
              ) : (
                <div className="text-center py-8 text-ink-soft border border-dashed border-rule rounded-sm p-6">
                  <Disc className="w-8 h-8 mx-auto mb-2 opacity-40 text-accent animate-pulse" />
                  <p className="font-serif italic text-sm text-ink mb-1">
                    Connect directly to Spotify's vast library
                  </p>
                  <p className="text-[11px] text-ink-soft max-w-xs mx-auto">
                    Type a track title or artist name above to pull real metadata, high-res cover art, and add it directly to your table.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: AUDIO URL / DIRECT STREAM */}
        {activeTab === 'url' && (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 font-mono text-xs">
            <div>
              <label className="block text-ink-soft mb-1 text-[11px] uppercase tracking-wider">
                Direct Audio Stream URL (.mp3 / radio stream) *
              </label>
              <input
                type="url"
                required
                placeholder="https://example.com/audio/song.mp3"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                className="w-full px-3 py-2 bg-paper border border-rule rounded-xs text-xs font-mono text-ink focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-ink-soft mb-1 text-[11px] uppercase tracking-wider">
                Cover Image URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/... or cover image URL"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                className="w-full px-3 py-2 bg-paper border border-rule rounded-xs text-xs font-mono text-ink focus:outline-none focus:border-accent"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-ink-soft mb-1 text-[11px] uppercase tracking-wider">
                  Track Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dreams"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-paper border border-rule rounded-xs text-xs font-mono text-ink focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-ink-soft mb-1 text-[11px] uppercase tracking-wider">
                  Artist Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fleetwood Mac"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  className="w-full px-3 py-2 bg-paper border border-rule rounded-xs text-xs font-mono text-ink focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-ink-soft mb-1 text-[11px] uppercase tracking-wider">
                  Album Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rumours"
                  value={albumTitle}
                  onChange={(e) => setAlbumTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-paper border border-rule rounded-xs text-xs font-mono text-ink focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-ink-soft mb-1 text-[11px] uppercase tracking-wider">
                  Duration (Seconds)
                </label>
                <input
                  type="number"
                  min="1"
                  max="7200"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2 bg-paper border border-rule rounded-xs text-xs font-mono text-ink focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-rule flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeAddMusic}
                className="px-4 py-2 border border-rule rounded-xs text-ink-soft hover:text-ink cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-ink text-paper rounded-xs hover:bg-accent transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Adding Track...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Add to Collection</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
