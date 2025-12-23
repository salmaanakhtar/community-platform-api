const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
  follower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  following: { type: String, required: true }, // can be user ID or hashtag
  type: { type: String, enum: ['user', 'hashtag'], required: true },
  createdAt: { type: Date, default: Date.now },
});

// Compound index to prevent duplicates
followSchema.index({ follower: 1, following: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Follow', followSchema);