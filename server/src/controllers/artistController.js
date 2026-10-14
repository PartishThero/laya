import Artist from '../models/Artist.js';
import Song from '../models/Song.js';
import Album from '../models/Album.js';

// GET /api/artists - list / search artists
export const getArtists = async (req, res, next) => {
  try {
    const { search = '', limit = 20, page = 1 } = req.query;
    const query = search ? { name: { $regex: search, $options: 'i' } } : {};

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));

    const [artists, total] = await Promise.all([
      Artist.find(query)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .sort({ name: 1 }),
      Artist.countDocuments(query)
    ]);

    res.json({
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      limit: limitNum,
      artists
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/artists/:artistId - artist details and associated music
export const getArtistById = async (req, res, next) => {
  try {
    const artist = await Artist.findById(req.params.artistId);
    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    const [songs, albums] = await Promise.all([
      Song.find({ artist: artist._id, isPublished: true }).populate('album', 'title coverUrl'),
      Album.find({ artist: artist._id })
    ]);

    res.json({
      artist,
      songs,
      albums
    });
  } catch (err) {
    next(err);
  }
};
