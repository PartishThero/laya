import Song from '../models/Song.js';
import Artist from '../models/Artist.js';
import Album from '../models/Album.js';

/**
 * Returns explainable recommendations based on popular or newly released items
 */
export const getCuratedDiscovery = async () => {
  const [songs, artists, albums] = await Promise.all([
    Song.find({ isPublished: true })
      .populate('artist', 'name imageUrl')
      .populate('album', 'title coverUrl')
      .sort({ createdAt: -1 })
      .limit(10),
    Artist.find().sort({ createdAt: -1 }).limit(6),
    Album.find().populate('artist', 'name').sort({ createdAt: -1 }).limit(6)
  ]);

  return { songs, artists, albums };
};

export default { getCuratedDiscovery };
