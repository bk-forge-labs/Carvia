/** Repeatable fixture setup for one explicitly named disposable database. Sends no mail. */
const mongoose = require('mongoose');
const {randomUUID} = require('node:crypto');
const {resolveTime,wallTime} = require('../services/workspaceTime');
const uri = process.env.VELTRENNE_WORKSPACE_PREVIEW_URI;
if (!/^mongodb:\/\/127\.0\.0\.1:\d+\/veltrenne_workspace_preview(?:\?|$)/.test(uri || '')) {
  throw new Error('Set VELTRENNE_WORKSPACE_PREVIEW_URI to the dedicated loopback veltrenne_workspace_preview database. MONGO_URI is intentionally not used.');
}
(async()=>{
  await mongoose.connect(uri);
  const User=require('../models/User'),Profile=require('../models/DealerProfile'),Car=require('../models/Car'),Enquiry=require('../models/Enquiry'),Appointment=require('../models/Appointment'),Task=require('../models/FollowUpTask');
  await Promise.all([User,Profile,Car,Enquiry,Appointment,Task].map(model=>model.init()));
  const users={};
  for(const role of ['dealer','admin','buyer']) users[role]=await User.findOne({email:'connected-'+role+'@example.invalid'}) || await User.create({name:'Synthetic '+role+' for workspace QA',email:'connected-'+role+'@example.invalid',password:'isolated QA login password',role,emailVerifiedAt:new Date()});
  const owner=users.dealer._id;
  await Profile.findOne({user:owner}) || await Profile.create({user:owner,companyName:'Synthetic Veltrenne QA dealership',phone:'000000',status:'approved'});
  const car=await Car.findOne({dealer:owner}) || await Car.create({dealer:owner,title:'BMW i4 — synthetic vehicle for local workflow review',brand:'BMW',model:'i4',year:2024,price:40000,mileage:12000});
  const enquiry=await Enquiry.findOne({dealer:owner}) || await Enquiry.create({dealer:owner,buyer:users.buyer._id,car:car._id,vehicleTitle:car.title,dealerName:'Synthetic Veltrenne QA dealership',message:'Please arrange a viewing and test drive. This is a synthetic local QA enquiry.'});
  const zone='Europe/Berlin',today=wallTime(new Date(),zone).slice(0,10);
  if(!await Appointment.exists({owner})) {
    for(let index=0;index<8;index++) {
      const date=new Date(today+'T12:00Z');date.setUTCDate(date.getUTCDate()+index);const day=date.toISOString().slice(0,10);
      await Appointment.create({owner,ownerRole:'dealer',requestKey:randomUUID(),title:index===0?'Viewing and test drive — extended appointment title for responsive review':'Synthetic '+(index%2?'meeting':'test drive')+' '+(index+1),type:index%2?'meeting':'test-drive',start:resolveTime(day+'T10:00',zone),end:resolveTime(day+'T11:00',zone),timeZone:zone,enquiry:enquiry._id,vehicle:car._id,customer:users.buyer._id,status:index===2?'cancelled':index===3?'completed':'scheduled',outcome:index===3?'Viewing completed; buyer requested a follow-up quote.':'',notes:'Private synthetic notes. Never include private notes in customer confirmation.'});
    }
  }
  if(!await Task.exists({owner})) await Task.create({owner,ownerRole:'dealer',requestKey:randomUUID(),title:'Follow up after the viewing — synthetic long-content task',dueAt:resolveTime(today+'T15:00',zone),timeZone:zone,enquiry:enquiry._id,vehicle:car._id,notes:'Confirm the next step and arrange another viewing if needed. '.repeat(4)});
  console.log('Isolated preview ready. Existing fixtures preserved. No email sent.');
})().catch(error=>{console.error(error.message);process.exitCode=1;}).finally(()=>mongoose.disconnect());
