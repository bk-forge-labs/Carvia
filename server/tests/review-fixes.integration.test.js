const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const uri = process.env.VELTRENNE_TEST_MONGO_URI;
test('isolated database: publication conflict, dealer re-review, single-use recovery, cleanup', {skip:!uri}, async () => {
 assert.match(uri, /^mongodb:\/\/127\.0\.0\.1:\d+\/veltrenne_review_test(?:\?|$)/);
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'veltrenne-test-photos-'));
 process.env.UPLOAD_DIR=dir;
 const Car=require('../models/Car'),Profile=require('../models/DealerProfile'),User=require('../models/User'),Token=require('../models/AccountToken');
 await mongoose.connect(uri);
 let fixtureUser;
 try {
  await Promise.all([Car.init(),Profile.init(),User.init(),Token.init()]);
  const user=await User.create({name:'Review Dealer',email:'review-dealer-'+require('node:crypto').randomUUID()+'@example.invalid',password:'original test password',role:'dealer'});
  fixtureUser=user;
  await Profile.create({user:user._id,companyName:'Reviewed Business',phone:'123',address:'Test',status:'approved'});
  await fs.writeFile(path.join(dir,'vehicle.png'),await require('sharp')({create:{width:3,height:3,channels:3,background:'white'}}).png().toBuffer());
  const car=await Car.create({title:'BMW i4',brand:'BMW',model:'i4',price:30000,year:2023,mileage:0,dealer:user._id,images:['/uploads/vehicle.png'],mainImage:'/uploads/vehicle.png'});
  let release, started;const gate=new Promise(resolve=>release=resolve);const read=new Promise(resolve=>started=resolve);
  const original=Car.collection.findOneAndUpdate;
  Car.collection.findOneAndUpdate=async function(filter,update,options){if(update.$set?.title==='Incorrect identity'){started();await gate;}return original.call(this,filter,update,options);};
  const editing=Car.findOneAndUpdate({_id:car._id},{$set:{title:'Incorrect identity'}},{new:true}).exec();
  const rejected=assert.rejects(editing,e=>e.statusCode===409);
  await read;
  await Car.findOneAndUpdate({_id:car._id},{$set:{isPublished:true}},{new:true});
  release();await rejected;Car.collection.findOneAndUpdate=original;
  assert.equal((await Car.findById(car._id)).title,'BMW i4');
  const res={status(code){this.code=code;return this;},json(body){this.body=body;return this;}};
  await require('../controllers/dealerController').updateMyProfile({user:{id:String(user._id)},body:{companyName:'Changed Business'}},res);
  assert.equal(res.body.data.status,'pending');assert.equal(res.body.data.reviewHistory,undefined);
  assert.equal((await Car.findById(car._id)).isPublished,false);
  const profile=await Profile.findOne({user:user._id});assert.equal(profile.reviewHistory.at(-1).action,'identity_changed');
  const editResponse={status(code){this.code=code;return this;},json(body){this.body=body;return this;}};
  await require('../controllers/carController').updateMyCar({params:{id:String(car._id)},user:{id:String(user._id)},body:{fuelType:'Electric',transmission:'Automatic',location:'Hamburg'}},editResponse);
  assert.equal(editResponse.code,200);assert.equal((await Car.findById(car._id)).fuelType,'Electric');
  const sent=[];
  const security=require('../services/accountSecurity').createAccountSecurity({User,Token,transaction:fn=>mongoose.connection.transaction(fn),send:async mail=>{sent.push(mail);return true;}});
  await security.issue(user,'reset');assert.equal(sent.length,1);
  const record=await Token.findOne({user:user._id,kind:'reset'});assert.notEqual(record.digest,sent[0].token);
  await assert.rejects(security.consume('verify',sent[0].token),e=>e.statusCode===400);
  const outcomes=await Promise.allSettled([security.consume('reset',sent[0].token,'my replacement password'),security.consume('reset',sent[0].token,'my replacement password')]);
  assert.equal(outcomes.filter(x=>x.status==='fulfilled').length,1);
  const updated=await User.findById(user._id).select('+password');assert.equal(updated.authVersion,1);assert(await updated.comparePassword('my replacement password'));assert(!await updated.comparePassword('original test password'));
  await security.issue(updated,'verify');await security.consume('verify',sent[1].token);assert((await User.findById(user._id)).emailVerifiedAt);
  await assert.rejects(security.consume('verify',sent[1].token),e=>e.statusCode===400);
  await security.change(user._id,'my replacement password','a second replacement password');assert.equal((await User.findById(user._id)).authVersion,2);
  await security.issue(updated,'reset');
  await Token.updateOne({user:user._id,kind:'reset'},{$set:{expiresAt:new Date(Date.now()-1000)}});
  await assert.rejects(security.consume('reset',sent.at(-1).token,'another test password'),e=>e.statusCode===400);
  const oldSecret=process.env.JWT_SECRET;process.env.JWT_SECRET='temporary-isolated-test-signing-secret';
  try {
    const protect=require('../middleware/authMiddleware').protect;
    const jwt=require('jsonwebtoken');
    for(const version of [1,2]){
      const req={cookies:{access_token:jwt.sign({id:String(user._id),authVersion:version},process.env.JWT_SECRET)}};
      const error=await new Promise(resolve=>protect(req,{},resolve));
      if(version===1)assert.equal(error.statusCode,401);else{assert.equal(error,undefined);assert(req.user.emailVerifiedAt);}
    }
  }finally{if(oldSecret===undefined)delete process.env.JWT_SECRET;else process.env.JWT_SECRET=oldSecret;}
  const {removeUnusedUploads}=require('../utils/removeUnusedUploads');
  await removeUnusedUploads(['/uploads/vehicle.png']);await fs.access(path.join(dir,'vehicle.png'));
  await Car.deleteOne({_id:car._id});await removeUnusedUploads(['/uploads/vehicle.png']);await assert.rejects(fs.access(path.join(dir,'vehicle.png')));
 } finally {
  if(fixtureUser && mongoose.connection.readyState===1) {
    await Promise.all([Car.deleteMany({dealer:fixtureUser._id}),Profile.deleteMany({user:fixtureUser._id}),Token.deleteMany({user:fixtureUser._id})]);
    await User.deleteOne({_id:fixtureUser._id});
  }
  await mongoose.disconnect();await fs.rm(dir,{recursive:true,force:true});
 }

});
