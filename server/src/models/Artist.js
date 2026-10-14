import mongoose from 'mongoose';

const artistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  bio: { type: String },
  imageUrl: { type: String },
  genres: [{ type: String }]
}, { timestamps: true });

export default mongoose.model('Artist', artistSchema);
