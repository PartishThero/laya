// models/card.model.js
// Canonical card model unifying Songs, Albums, and Playlists for the 2D canvas

export function toCard(entity, explicitKind = null) {
  if (!entity) return null;

  // Determine kind
  let kind = explicitKind;
  if (!kind) {
    if (entity.audioUrl || (entity.duration && !entity.tracks)) {
      kind = 'song';
    } else if (entity.tracks !== undefined || (entity.artist && entity.releaseDate)) {
      kind = 'album';
    } else if (entity.songs !== undefined || entity.isPublic !== undefined) {
      kind = 'playlist';
    } else {
      kind = 'song';
    }
  }

  const id = `${kind}:${entity._id || entity.id || Math.random().toString(36).substring(2, 9)}`;
  const entityId = entity._id || entity.id;

  let title = entity.title || entity.name || 'Untitled';
  let subtitle = '';
  let artUrl = entity.coverUrl || entity.imageUrl || null;
  let audioUrl = entity.audioUrl || null;
  let meta = {};

  if (kind === 'song') {
    subtitle = entity.artist?.name || entity.artist || 'Unknown Artist';
    if (!artUrl && entity.album?.coverUrl) {
      artUrl = entity.album.coverUrl;
    }
    meta = {
      duration: entity.duration || 0,
      genre: entity.genre || '',
      artistName: subtitle,
      albumTitle: entity.album?.title || ''
    };
  } else if (kind === 'album') {
    subtitle = entity.artist?.name || entity.artist || 'Unknown Artist';
    meta = {
      trackCount: Array.isArray(entity.tracks) ? entity.tracks.length : (entity.trackCount || 0),
      releaseDate: entity.releaseDate || null,
      year: entity.releaseDate ? new Date(entity.releaseDate).getFullYear() : null
    };
  } else if (kind === 'playlist') {
    subtitle = entity.owner?.displayName || entity.owner?.username || 'Curator';
    meta = {
      trackCount: Array.isArray(entity.songs) ? entity.songs.length : (entity.songCount || 0),
      isPublic: entity.isPublic ?? true,
      description: entity.description || ''
    };
  }

  return {
    id,
    kind,
    entityId,
    title,
    subtitle,
    artUrl,
    audioUrl,
    accent: entity.accent || null,
    meta,
    playable: true,
    droppable: kind === 'playlist',
    raw: entity
  };
}

export function cardSize(kind) {
  switch (kind) {
    case 'song':
      return { width: 200, height: 200 };
    case 'album':
      return { width: 260, height: 260 };
    case 'playlist':
      return { width: 210, height: 170 };
    default:
      return { width: 190, height: 220 };
  }
}

export function cardLabel(card) {
  if (!card) return '';
  const kindCap = card.kind.charAt(0).toUpperCase() + card.kind.slice(1);
  return `${kindCap}: ${card.title}, by ${card.subtitle}. Press Enter to play, Q to queue, A to add to a playlist.`;
}

export function fallbackArt(card) {
  // Deterministic subtle typographic background based on card title
  const title = card?.title || 'L';
  const hue = Math.abs(title.split('').reduce((acc, char) => acc + char.charCodeAt(0) * 17, 0)) % 360;
  return `hsl(${hue}, 25%, 35%)`;
}
