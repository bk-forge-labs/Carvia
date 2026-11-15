const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  car: {type:mongoose.Schema.Types.ObjectId,ref:'Car',required:true},
  buyer: {type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
  dealer: {type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
  vehicleTitle: {type:String,required:true},
  dealerName: {type:String,required:true},
  message: {type:String,required:true,minlength:20,maxlength:1500},
  replies: [{requestKey:{type:String,required:true},author:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},role:{type:String,enum:['buyer','dealer'],required:true},text:{type:String,maxlength:1500,required:true},at:{type:Date,required:true}}],
  status: {type:String,enum:['new','contacted','closed'],default:'new'},
}, {timestamps:true});
schema.index({buyer:1,car:1},{unique:true});
schema.index({dealer:1,createdAt:-1});
schema.index({buyer:1,createdAt:-1});
module.exports = mongoose.model('Enquiry',schema);
