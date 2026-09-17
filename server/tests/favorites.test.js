const test = require('node:test');
const assert = require('node:assert/strict');
const User = require('../models/User');
const Car = require('../models/Car');
const { setFavorite } = require('../controllers/favoriteController');
const id = 'aaaaaaaaaaaaaaaaaaaaaaaa';
async function run(method, overrides = {}, carId = id) {
  const originalUser = User.findByIdAndUpdate, originalCar = Car.exists;
  const writes = [];
  User.findByIdAndUpdate = async (...args) => { writes.push(args); if (overrides.error) throw Error('secret connection string'); return overrides.missingUser ? null : {favorites: method === 'PUT' ? [id] : []}; };
  Car.exists = async () => !overrides.missingCar;
  const res = {statusCode:200,status(code){this.statusCode=code;return this;},json(body){this.body=body;return this;}};
  try { await setFavorite({method,params:{carId},user:{id:'authenticated-user'}},res); return {res,writes}; }
  finally {User.findByIdAndUpdate=originalUser;Car.exists=originalCar;}
}
test('rejects invalid vehicle IDs without writes',async()=>{const {res,writes}=await run('PUT',{},'bad');assert.equal(res.statusCode,400);assert.equal(writes.length,0);});
test('saving unavailable inventory is rejected',async()=>{const {res,writes}=await run('PUT',{missingCar:true});assert.equal(res.statusCode,404);assert.equal(writes.length,0);});
test('save uses atomic set membership on authenticated user only',async()=>{const {res,writes}=await run('PUT');assert.equal(res.body.isFavorite,true);assert.deepEqual(writes[0],['authenticated-user',{$addToSet:{favorites:id}},{new:true}]);});
test('removal works even after a listing disappears and never toggles',async()=>{const {res,writes}=await run('DELETE',{missingCar:true});assert.equal(res.body.isFavorite,false);assert.deepEqual(writes[0][1],{$pull:{favorites:id}});});
test('missing user is not reported as success',async()=>{const {res}=await run('DELETE',{missingUser:true});assert.equal(res.statusCode,404);});
test('database errors do not expose internal details',async()=>{const {res}=await run('PUT',{error:true});assert.equal(res.statusCode,500);assert(!JSON.stringify(res.body).includes('secret'));});
