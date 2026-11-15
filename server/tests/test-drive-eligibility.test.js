const test=require('node:test');
const assert=require('node:assert/strict');
const {testDriveEligibility}=require('../services/testDriveEligibility');
const {updateCarSchema}=require('../validations/car.validations');
test('test-drive setting accepts only explicit booleans',()=>{
 for(const value of ['true','false',1,0,null,{},[]])assert.equal(updateCarSchema.safeParse({testDriveAvailable:value}).success,false);
 for(const value of [true,false])assert.equal(updateCarSchema.safeParse({testDriveAvailable:value}).success,true);
});
test('legacy, disabled, unpublished, sold, held and demo listings cannot accept test drives',()=>{
 const car={isPublished:true,testDriveAvailable:true},dealer={status:'approved'};
 assert.equal(testDriveEligibility(car,dealer).eligible,true);
 for(const change of [{testDriveAvailable:undefined},{testDriveAvailable:false},{isPublished:false},{status:'sold'},{soldAt:new Date()},{publicationHold:'review'},{isDemo:true}])assert.equal(testDriveEligibility({...car,...change},dealer).eligible,false);
 for(const status of ['pending','suspended','rejected'])assert.equal(testDriveEligibility(car,{status}).eligible,false);
 assert.equal(testDriveEligibility(car,null).eligible,false);
});
