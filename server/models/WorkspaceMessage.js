const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  appointment: {type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true},
  appointmentVersion: {type: Number, required: true},
  recipient: {type: String, required: true},
  subject: {type: String, required: true},
  text: {type: String, required: true},
  state: {type: String, enum: ['queued', 'sending', 'provider-accepted', 'failed', 'unknown'], default: 'queued'},
  messageId: {type: String, default: ''},
  failure: {type: String, default: ''},
  attempts: {type: Number, default: 0},
  acceptedAt: {type: Date, default: null},
}, {timestamps: true});
schema.index({owner: 1, appointment: 1, appointmentVersion: 1}, {unique: true});
schema.index({owner: 1, createdAt: -1});
module.exports = mongoose.model('WorkspaceMessage', schema);
