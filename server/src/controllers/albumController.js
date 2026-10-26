import Album from '../models/Album.js';
import Song from '../models/Song.js';

// GET /api/albums - list / search albums
export const getAlbums = async (req, res, next) => {
  try {
    const { search = '', limit = 20, page = 1 } = req.query;
    const query = search ? { title: { $regex: search, $options: 'i' } } : {};

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));

    const [albums, total] = await Promise.all([
      Album.find(query)
        .populate('artist', 'name imageUrl')
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .sort({ createdAt: -1 }),
      Album.countDocuments(query)
    ]);

    res.json({
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      limit: limitNum,
      albums
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/albums/:albumId - album details and ordered tracks
export const getAlbumById = async (req, res, next) => {
  try {
    const album = await Album.findById(req.params.albumId)
      .populate('artist', 'name bio imageUrl');

    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }

    const tracks = await Song.find({ album: album._id, isPublished: true })
      .populate('artist', 'name')
      .sort({ createdAt: 1 });

    const albumObj = album.toObject ? album.toObject() : album;
    res.json({
      ...albumObj,
      album: albumObj,
      tracks
    });
  } catch (err) {
    next(err);
  }
};
