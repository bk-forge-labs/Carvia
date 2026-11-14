const test = require('node:test');
const assert = require('node:assert/strict');
const sharp = require('sharp');
const {validateImage} = require('../utils/validateImage');
const {serializeDealerProfile} = require('../utils/dealerProfileResponse');
const {createCarSchema, updateCarSchema} = require('../validations/car.validations');
const {publicInventory} = require('../utils/publicInventory');
const {passwordInput,digest} = require('../services/accountSecurity');
test('image validation rejects truncated files even with genuine magic headers', async () => {
 for (const [mime, bytes] of [['image/jpeg',Buffer.from([255,216,255])],['image/png',Buffer.from([137,80,78,71,13,10,26,10])],['image/webp',Buffer.from('RIFF0000WEBP')]]) await assert.rejects(validateImage(bytes,mime), e=>e.statusCode===400);
});
test('images decode, lose metadata and reject a mismatched declared format', async () => {
 const png=await sharp({create:{width:4,height:4,channels:3,background:'#ccb080'}}).png().toBuffer();
 const result=await validateImage(png,'image/png'); assert.equal((await sharp(result).metadata()).width,4);
 await assert.rejects(validateImage(png,'image/jpeg'),e=>e.statusCode===400);
});
test('vehicle technical fields survive create and update validation', () => {
 const values={fuelType:'Electric',transmission:'Automatic',location:' Hamburg '};
 const created=createCarSchema.parse({...values,title:'BMW i4',brand:'BMW',model:'i4',price:30000,year:2023,mileage:0,owner:'Dealer',condition:'Non-Smoker'});
 assert.equal(created.location,'Hamburg');assert.equal(created.fuelType,'Electric');
 assert.deepEqual(updateCarSchema.parse(values),{...values,location:'Hamburg'});
 assert.throws(()=>updateCarSchema.parse({fuelType:'invented'}));
});
test('dealer read and write serializer never exposes internal review material', () => {
 const data=serializeDealerProfile({_id:'id',status:'pending',moderation:{by:'secret',at:new Date(),lastAction:'approved'},reviewHistory:[{note:'private'}]});
 assert.equal(data.canPostCars,false);assert.equal(data.reviewHistory,undefined);assert.equal(data.moderation,undefined);assert.equal(data.lastModeration.by,undefined);
});
test('production inventory excludes samples without removing local records', () => {
 assert.deepEqual(publicInventory({NODE_ENV:'production'}),{isPublished:true,isDemo:{$ne:true}});
 assert.deepEqual(publicInventory({NODE_ENV:'development'}),{isPublished:true});
});
test('new passwords enforce a byte limit and token digests do not store bearer secrets', () => {
 assert.throws(()=>passwordInput('short'));assert.throws(()=>passwordInput('é'.repeat(37)));
 assert.equal(passwordInput('a long new password'),'a long new password');assert.notEqual(digest('secret'),'secret');
});
