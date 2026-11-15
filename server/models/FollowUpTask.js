const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, immutable: true},
  ownerRole: {type: String, enum: ['dealer', 'admin'], required: true, immutable: true},
  requestKey: {type: String, required: true, immutable: true},
  title: {type: String, required: true, maxlength: 160},
  dueAt: {type: Date, required: true},
  timeZone: {type: String, required: true},
  status: {type: String, enum: ['open', 'in-progress', 'done', 'cancelled'], default: 'open'},
  enquiry: {type: mongoose.Schema.Types.ObjectId, ref: 'Enquiry', default: null},
  vehicle: {type: mongoose.Schema.Types.ObjectId, ref: 'Car', default: null},
  appointment: {type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null},
  notes: {type: String, maxlength: 2000, default: ''},
}, {timestamps: true, optimisticConcurrency: true});
schema.index({owner: 1, requestKey: 1}, {unique: true});
schema.index({owner: 1, dueAt: 1});
module.exports = mongoose.model('FollowUpTask', schema);
