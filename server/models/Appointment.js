const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, immutable: true},
  ownerRole: {type: String, enum: ['dealer', 'admin'], required: true, immutable: true},
  requestKey: {type: String, required: true, immutable: true},
  buyerRequest: {type:Boolean,default:false,immutable:true},
  buyerMessage: {type:String,maxlength:1500,default:''},
  reservedStart: {type:Date,default:null},
  reservedEnd: {type:Date,default:null},
  reservedTimeZone: {type:String,default:null},
  publicUpdate: {type:String,maxlength:2000,default:''},
  publicOutcome: {type:String,maxlength:2000,default:''},
  title: {type: String, required: true, maxlength: 160},
  type: {type: String, enum: ['meeting', 'test-drive'], required: true},
  start: {type: Date, required: true},
  end: {type: Date, required: true},
  timeZone: {type: String, required: true},
  vehicle: {type: mongoose.Schema.Types.ObjectId, ref: 'Car', default: null},
  enquiry: {type: mongoose.Schema.Types.ObjectId, ref: 'Enquiry', default: null},
  followUpTask: {type: mongoose.Schema.Types.ObjectId, ref: 'FollowUpTask', default:null, immutable:true},
  customer: {type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null},
  notes: {type: String, maxlength: 2000, default: ''},
  status: {type: String, enum: ['requested', 'reschedule-proposed', 'declined', 'scheduled', 'cancelled', 'completed'], default: 'scheduled'},
  outcome: {type: String, maxlength: 2000, default: ''},
}, {timestamps: true, optimisticConcurrency: true});
schema.index({owner: 1, requestKey: 1}, {unique: true});
schema.index({owner: 1, start: 1, end: 1});
module.exports = mongoose.model('Appointment', schema);
