require('dotenv').config({path:require('node:path').join(__dirname,'../.env'),quiet:true});
const mongoose=require('mongoose');
const fs=require('node:fs');
const path=require('node:path');
const Car=require('../models/Car');
const DealerProfile=require('../models/DealerProfile');
const {uploadDir,ensureUploadDir}=require('../config/storage');
const batch='owner-approved-catalog-2026-09-17';
async function run(){
 await mongoose.connect(process.env.MONGO_URI);
 if(mongoose.connection.name==='carvia_presentation_v1')throw Error('Use the original database, not the retired presentation database');
 const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'../catalog-assets/manifest.json'),'utf8'));
 if(manifest.length!==25)throw Error('Exactly 25 image-backed records are required');
 const owner=await Car.findById('6a2d49aac85a0352b8bb0e29').select('dealer').lean();
 if(!owner || !await DealerProfile.exists({user:owner.dealer,status:'approved'}))throw Error('Existing approved dealer required');
 const existing=await Car.countDocuments({importBatch:batch});
 if(existing){if(existing!==25)throw Error('Partial prior import requires review');console.log('Already imported: 25. No changes.');await mongoose.disconnect();return;}
 ensureUploadDir();
 const docs=manifest.map((item,i)=>{
 const filename=`carvia-catalog-${String(i+1).padStart(2,'0')}${path.extname(item.file)}`;
 fs.copyFileSync(path.join(__dirname,'../catalog-assets',item.file),path.join(uploadDir,filename));
 return {_id:new mongoose.Types.ObjectId('ca25'+(i+1).toString(16).padStart(20,'0')),importBatch:batch,isDemo:true,title:`${item.brand} ${item.model}`,brand:item.brand,model:item.model,year:2024-(i%3),mileage:8400+i*1730,price:item.price,bodyStyle:item.bodyStyle,fuelType:item.fuelType,transmission:'Automatic',location:['Berlin','Hamburg','Munich','Cologne','Frankfurt'][i%5],owner:'Dealer',condition:'Non-Smoker',dealer:owner.dealer,isPublished:true,images:[`/uploads/${filename}`],mainImage:`/uploads/${filename}`,imageCredit:{source:item.source,author:item.author,license:item.license,licenseUrl:item.licenseUrl},description:`${item.brand} ${item.model} — an illustrative ${item.bodyStyle.toLowerCase()} listing for exploring Carvia.\n\nFictional asking price, model year, mileage and specifications; this vehicle is not for sale. The photograph shows the model family and may differ from the stated year or configuration.\n\nManage this record through the normal dealer inventory: edit its details, upload photographs, publish, unpublish or delete it.`};
 });
 await mongoose.connection.transaction(async session=>{await Car.create(docs,{session,ordered:true});});
 console.log(JSON.stringify({inserted:await Car.countDocuments({importBatch:batch}),published:await Car.countDocuments({importBatch:batch,isPublished:true}),owner:String(owner.dealer)}));
 await mongoose.disconnect();
}
run().catch(error=>{console.error(error.message);process.exit(1);});
