const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  kind: { type: String, enum: ['reset', 'verify'], required: true },
  digest: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
schema.index({ user: 1, kind: 1 }, { unique: true });
module.exports = mongoose.model('AccountToken', schema);
