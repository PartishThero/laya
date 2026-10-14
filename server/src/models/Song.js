import mongoose from 'mongoose';

const songSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true },
  album: { type: mongoose.Schema.Types.ObjectId, ref: 'Album' },
  audioUrl: { type: String, required: true },
  coverUrl: { type: String },
  duration: { type: Number }, // seconds
  genre: { type: String },
  releaseDate: { type: Date },
  licence: { type: String },
  attribution: { type: String },
  isPublished: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Song', songSchema);
