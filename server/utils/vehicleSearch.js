const AppError = require('./AppError');
const colors = ['Black','White','Grey','Silver','Blue','Red','Green','Brown','Beige','Yellow','Orange','Purple','Gold','Other'];
const enums = {bodyStyle:['SUV','Sedan','Coupe','Convertible','Hatchback','Estate','Van'],fuelType:['Petrol','Diesel','Electric','Hybrid','Plug-in hybrid','LPG','Hydrogen','Other'],transmission:['Automatic','Manual','Other'],exteriorColor:colors};
function text(query,key){const value=query[key];if(value==null||value==='')return '';if(typeof value!=='string'||value.length>150)throw new AppError(`Invalid ${key} filter`,400);return value.trim();}
function exact(value){const escaped=[...value].map(c=>'\\^$.*+?()[]{}|'.includes(c)?'\\'+c:c).join('');return {$regex:`^${escaped}$`,$options:'i'};}
function vehicleSearch(query){
 const filter={};
 for(const key of ['brand','model']){const value=text(query,key);if(value)filter[key]=exact(value);}
 for(const [key,allowed] of Object.entries(enums)){const value=text(query,key);if(!value)continue;const values=[...new Set(value.split(','))];if(values.some(v=>!allowed.includes(v)))throw new AppError(`Invalid ${key} filter`,400);filter[key]={$in:values};}
 for(const [field,minKey,maxKey,low,high] of [['price','minPrice','maxPrice',0,1e9],['year','minYear','maxYear',1900,new Date().getFullYear()+1],['mileage','minMileage','maxMileage',0,1e8]]){
  const range={};for(const [key,op] of [[minKey,'$gte'],[maxKey,'$lte']]){const value=text(query,key);if(!value)continue;const n=Number(value);if(!Number.isFinite(n)||n<low||n>high||(field!=='price'&&!Number.isInteger(n)))throw new AppError(`Invalid ${key} filter`,400);range[op]=n;}
  if(range.$gte!=null&&range.$lte!=null&&range.$gte>range.$lte)throw new AppError(`Minimum ${field} must not exceed maximum`,400);
  if(Object.keys(range).length)filter[field]=range;
 }
 for(const [key,max] of [['seats',9],['doors',6]]){const value=text(query,key);if(value){const n=Number(value);if(!Number.isInteger(n)||n<1||n>max)throw new AppError(`Invalid ${key} filter`,400);filter[key]=n;}}
 return filter;
}
module.exports={vehicleSearch,colors,text,exact};
