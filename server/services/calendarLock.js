const mongoose=require('mongoose');
const schema=new mongoose.Schema({_id:mongoose.Schema.Types.ObjectId,revision:{type:Number,default:0}});
const Lock=mongoose.models.WorkspaceCalendarLock||mongoose.model('WorkspaceCalendarLock',schema);
async function withCalendarLock(owner,operation){
 try{await Lock.updateOne({_id:owner},{$setOnInsert:{revision:0}},{upsert:true});}catch(error){if(error.code!==11000)throw error;}
 return mongoose.connection.transaction(async session=>{await Lock.updateOne({_id:owner},{$inc:{revision:1}},{session});return operation(session);});
}
module.exports={withCalendarLock};

// A confirmed slot stays reserved until the buyer accepts a proposed replacement.
module.exports.overlap = (start,end) => ({$or:[{status:"scheduled",start:{$lt:end},end:{$gt:start}},{status:"reschedule-proposed",reservedStart:{$lt:end},reservedEnd:{$gt:start}}]});
