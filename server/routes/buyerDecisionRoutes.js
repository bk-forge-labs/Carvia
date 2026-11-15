const router=require('express').Router();
const {z}=require('zod');
const {protect}=require('../middleware/authMiddleware');
const {authorize}=require('../middleware/roleMiddleware');
const asyncHandler=require('../utils/asyncHandler');
const AppError=require('../utils/AppError');
const Decision=require('../models/BuyerDecision');
const User=require('../models/User');
const id=z.string().regex(/^[a-f0-9]{24}$/i);
const input=z.object({note:z.string().trim().max(3000),question:z.string().trim().max(1500),expectedVersion:z.number().int().min(0).nullable()}).strict();
router.use(protect,authorize('buyer'),(req,res,next)=>{res.set('Cache-Control','no-store');next();});
router.get('/',asyncHandler(async(req,res)=>{const filter={buyer:req.user.id};if(req.query.vehicles!==undefined){const parsed=z.string().transform(v=>v.split(',')).pipe(z.array(id).min(1).max(100)).safeParse(req.query.vehicles);if(!parsed.success)throw new AppError('Choose up to 100 valid vehicles.',400);filter.vehicle={$in:parsed.data};}const page=Math.max(1,Math.min(10000,parseInt(req.query.page,10)||1));const [data,total]=await Promise.all([Decision.find(filter).sort({updatedAt:-1,_id:-1}).skip((page-1)*100).limit(100).lean(),Decision.countDocuments(filter)]);res.json({data,total,page,pages:Math.ceil(total/100)});}));
router.put('/:id',asyncHandler(async(req,res)=>{
 const parsed=input.safeParse(req.body);
 if(!id.safeParse(req.params.id).success||!parsed.success)throw new AppError('Enter a valid vehicle, note, question and version.',400);
 const body=parsed.data;
 if(!await User.exists({_id:req.user.id,favorites:req.params.id}))throw new AppError('Save this vehicle before recording private notes.',404);
 const scope={buyer:req.user.id,vehicle:req.params.id};
 let record;
 if(body.expectedVersion===null){
  try{record=await Decision.create({...scope,note:body.note,question:body.question});}
  catch(error){if(error.code===11000)throw new AppError('These notes changed. Reload before saving.',409);throw error;}
 }else{
  record=await Decision.findOneAndUpdate({...scope,__v:body.expectedVersion},{$set:{note:body.note,question:body.question},$inc:{__v:1}},{returnDocument:'after',runValidators:true});
  if(!record)throw new AppError('These notes changed. Reload before saving.',409);
 }
 res.json({data:record});
}));
module.exports=router;
