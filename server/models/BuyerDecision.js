const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  buyer: {type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,immutable:true},
  vehicle: {type:mongoose.Schema.Types.ObjectId,ref:'Car',required:true,immutable:true},
  note: {type:String,maxlength:3000,default:''},
  question: {type:String,maxlength:1500,default:''},
}, {timestamps:true,optimisticConcurrency:true});
schema.index({buyer:1,vehicle:1},{unique:true});
module.exports = mongoose.model('BuyerDecision',schema);
