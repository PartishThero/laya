import mongoose from 'mongoose';

const listeningEventSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  song: { type: mongoose.Schema.Types.ObjectId, ref: 'Song', required: true },
  playedAt: { type: Date, default: Date.now },
  positionSeconds: { type: Number },
  completed: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('ListeningEvent', listeningEventSchema);
