const test=require('node:test');
const assert=require('node:assert/strict');
const {validateInput,scope,statusInput}=require('../services/enquiryService');
test('enquiries validate vehicle identity and message before database access',()=>{
 for(const body of [{},{carId:'bad',message:'A meaningful vehicle enquiry.'},{carId:'a'.repeat(24),message:'  short  '},{carId:'a'.repeat(24),message:'x'.repeat(1501)}])assert.throws(()=>validateInput(body));
 assert.deepEqual(validateInput({carId:'a'.repeat(24),message:'  A meaningful vehicle enquiry.  ',dealer:'spoofed'}),{carId:'a'.repeat(24),message:'A meaningful vehicle enquiry.'});
});
test('inbox ownership always derives from authenticated identity',()=>{
 assert.deepEqual(scope({id:'buyer',role:'buyer'}),{buyer:'buyer'});
 assert.deepEqual(scope({id:'dealer',role:'dealer'}),{dealer:'dealer'});
 assert.throws(()=>scope({id:'admin',role:'admin'}));
});
test('status changes require a known current state and valid destination',()=>{
 assert.throws(()=>statusInput({status:'closed'}));
 assert.throws(()=>statusInput({status:'published',previousStatus:'new'}));
 assert.deepEqual(statusInput({status:'contacted',previousStatus:'new'}),{status:'contacted',previousStatus:'new'});
});
