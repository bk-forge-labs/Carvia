const test=require('node:test');
const assert=require('node:assert/strict');
const {vehicleSearch,exact}=require('../utils/vehicleSearch');
const {updateCarSchema}=require('../validations/car.validations');
const {reviewFingerprint}=require('../utils/publicationQuality');
test('combined filters constrain fields and colour choices use OR',()=>{
 const result=vehicleSearch({brand:'BMW',model:'320i (Sport)',transmission:'Automatic',fuelType:'Petrol',minMileage:'0',maxMileage:'50000',minYear:'2020',exteriorColor:'Blue,Black',seats:'5',doors:'4'});
 assert.deepEqual(result.exteriorColor,{$in:['Blue','Black']});assert.deepEqual(result.mileage,{$gte:0,$lte:50000});assert.equal(result.seats,5);assert.deepEqual(result.transmission,{$in:['Automatic']});
 assert.equal(new RegExp(result.model.$regex,'i').test('320i (Sport)'),true);assert.equal(new RegExp(result.model.$regex,'i').test('320i Sport'),false);
 assert.equal(new RegExp(exact('.*').$regex).test('anything'),false);
});
test('bad ranges, arrays, nested operators and invalid specifications are rejected',()=>{
 for(const query of [{maxMileage:'-1'},{minYear:'2024',maxYear:'2020'},{minPrice:'20',maxPrice:'10'},{seats:'2.5'},{doors:'9'},{transmission:{$ne:''}},{brand:['BMW','Audi']},{exteriorColor:'Invisible'},{minMileage:'Infinity'}])assert.throws(()=>vehicleSearch(query),e=>e.statusCode===400);
 assert.deepEqual(vehicleSearch({}),{});
});
test('dealer specifications validate without making unknown values required',()=>{
 assert.deepEqual(updateCarSchema.parse({exteriorColor:'Blue',seats:5,doors:4}),{exteriorColor:'Blue',seats:5,doors:4});
 assert.deepEqual(updateCarSchema.parse({seats:null,doors:null,exteriorColor:''}),{seats:null,doors:null,exteriorColor:''});
 for(const values of [{seats:1.5},{doors:8},{exteriorColor:'Invisible'}])assert.throws(()=>updateCarSchema.parse(values));
});
test('unknown new details preserve existing approval fingerprint; confirmed edits change it',()=>{
 const car={title:'BMW i4',brand:'BMW',model:'i4'};assert.equal(reviewFingerprint(car),reviewFingerprint({...car,seats:null,doors:null,exteriorColor:''}));assert.notEqual(reviewFingerprint(car),reviewFingerprint({...car,seats:5}));
});
