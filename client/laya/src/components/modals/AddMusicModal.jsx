// components/modals/AddMusicModal.jsx
import React, { useState, useEffect } from 'react';
import { useAddMusic } from '@/app/providers/AddMusicContext.jsx';
import { useToast } from '@/app/providers/ToastContext.jsx';
import { catalogueApi } from '@/services/api/catalogue.api.js';
import { 
  X, 
  Upload, 
  Music, 
  Link as LinkIcon, 
  Disc, 
  Check, 
  Loader2, 
  Image as ImageIcon
} from 'lucide-react';

export function AddMusicModal() {
  const { isOpen, closeAddMusic } = useAddMusic();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'url'
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form states
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
      addToast(`✨ Added "${title.trim()}" to catalogue`, 'success');
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
              Laya Analog Archive
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
                  <span className="text-[10px] text-ink-soft block mt-1">Uses vintage vinyl art if left empty.</span>
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
                  placeholder="e.g. butterflies."
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
                  placeholder="e.g. Brent Faiyaz"
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
                  placeholder="e.g. Sonder Son"
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
                  placeholder="Vinyl, R&B, Soul..."
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
                    <span>Adding to Collection...</span>
                  </>
                ) : (
                  <>
                    <Disc className="w-3.5 h-3.5" />
                    <span>Add to Canvas</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: AUDIO URL / DIRECT STREAM */}
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
                placeholder="https://images.unsplash.com/... or image link"
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
                    <span>Adding to Collection...</span>
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
