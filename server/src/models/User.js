import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  displayName: { type: String, required: true },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  avatarUrl: { type: String },
  likedSongs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
  followedArtists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artist' }]
}, { timestamps: true });

export default mongoose.model('User', userSchema);
