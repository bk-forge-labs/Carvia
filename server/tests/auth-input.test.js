const test = require('node:test');
const assert = require('node:assert/strict');
const {authInput} = require('../utils/authInput');
test('authentication rejects non-string query operators and invalid bodies', () => {
 for (const body of [null, {}, {email: {$ne:null},password:'secret'}, {email:'a@b.com',password:[]}, {email:'bad',password:'secret'}]) assert.throws(()=>authInput(body), e=>e.statusCode===400);
});
test('registration normalizes email and name without granting admin access', () => {
 const result=authInput({name:' Owner ',email:' OWNER@EXAMPLE.TECH ',password:'secretphrase12',role:'admin'},true);
 assert.equal(result.email,'owner@example.tech');assert.equal(result.name,'Owner');assert.equal(result.role,'buyer');
});
test('registration rejects invalid names and passwords beyond bcrypt byte limit', () => {
 const valid={name:'Owner',email:'owner@example.com',password:'secretphrase12'};
 for(const edit of [{name:{}},{name:'x'},{password:'short'},{password:'é'.repeat(37)}]) assert.throws(()=>authInput({...valid,...edit},true),e=>e.statusCode===400);
});
