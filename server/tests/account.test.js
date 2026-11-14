const test=require('node:test');
const assert=require('node:assert/strict');
const User=require('../models/User');
const {update}=require('../controllers/accountController');
function response(){return {statusCode:200,set(){},status(code){this.statusCode=code;return this;},json(body){this.body=body;return this;}};}
test('account update validates names and rejects role or email changes',async()=>{for(const body of [{name:' '},{name:'x'.repeat(51)},{name:'Buyer',role:'admin'},{name:'Buyer',email:'other@example.com'}]){const res=response();await update({body,user:{id:'owner'}},res);assert.equal(res.statusCode,400);}});
test('account update only targets authenticated user and returns safe fields',async()=>{const original=User.findByIdAndUpdate;let args;try{User.findByIdAndUpdate=(...input)=>{args=input;return {select:async()=>({_id:'owner',name:'New name',email:'buyer@example.com',role:'buyer',password:'never return'})};};const res=response();await update({body:{name:' New name '},user:{id:'owner'}},res);assert.equal(args[0],'owner');assert.deepEqual(args[1],{$set:{name:'New name'}});assert.equal(res.body.user.password,undefined);assert.equal(res.body.user.name,'New name');}finally{User.findByIdAndUpdate=original;}});
