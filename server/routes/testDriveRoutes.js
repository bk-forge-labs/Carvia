const router=require('express').Router();
const {z}=require('zod');
const {protect}=require('../middleware/authMiddleware');
const {authorize}=require('../middleware/roleMiddleware');
const asyncHandler=require('../utils/asyncHandler');
const AppError=require('../utils/AppError');
const Appointment=require('../models/Appointment');
const Car=require('../models/Car');
const Profile=require('../models/DealerProfile');
const Enquiry=require('../models/Enquiry');
const {withCalendarLock,overlap}=require('../services/calendarLock');
const {interval}=require('../services/workspaceTime');
const {testDriveEligibility}=require('../services/testDriveEligibility');
const id=z.string().regex(/^[a-f0-9]{24}$/i);
const times={startLocal:z.string(),endLocal:z.string(),timeZone:z.string().max(100),startOccurrence:z.enum(['','earlier','later']).optional(),endOccurrence:z.enum(['','earlier','later']).optional()};
const create=z.object({...times,enquiry:id,requestKey:z.string().uuid(),message:z.string().trim().max(1500)}).strict();
const change=z.object({...times,expectedVersion:z.number().int().min(0),action:z.enum(['confirm','decline','propose-reschedule','accept-reschedule','cancel','complete']),update:z.string().trim().max(2000).default('')}).strict();
const view=a=>({id:String(a._id),vehicle:String(a.vehicle),enquiry:String(a.enquiry),title:a.title,start:a.start,end:a.end,timeZone:a.timeZone,status:a.status,reservedStart:a.reservedStart,reservedEnd:a.reservedEnd,reservedTimeZone:a.reservedTimeZone,message:a.buyerMessage,update:a.publicUpdate,outcome:a.publicOutcome,version:a.__v});
router.use(protect,authorize('buyer','dealer'),(req,res,next)=>{res.set('Cache-Control','no-store');next();});
const scope=req=>({buyerRequest:true,...(req.user.role==='buyer'?{customer:req.user.id}:{owner:req.user.id,ownerRole:'dealer'})});
router.get('/summary',authorize('dealer'),asyncHandler(async(req,res)=>{const filter=scope(req);const [pending,upcoming,items]=await Promise.all([Appointment.countDocuments({...filter,status:{$in:['requested','reschedule-proposed']}}),Appointment.countDocuments({...filter,status:'scheduled',end:{$gte:new Date()}}),Appointment.find({...filter,status:{$in:['requested','reschedule-proposed','scheduled']}}).sort({start:1}).limit(8)]);res.json({pending,upcoming,data:items.map(view)});}));
router.get('/',asyncHandler(async(req,res)=>{const page=Math.max(1,Math.min(10000,Math.floor(Number(req.query.page))||1));const filter={...scope(req),...(id.safeParse(req.query.enquiry).success?{enquiry:req.query.enquiry}:{})};const [records,total]=await Promise.all([Appointment.find(filter).sort({start:-1}).skip((page-1)*25).limit(25),Appointment.countDocuments(filter)]);const hasActive=!!await Appointment.exists({...filter,status:{$in:['requested','scheduled','reschedule-proposed']}});res.json({data:records.map(view),total,page,pages:Math.ceil(total/25),hasActive});}));
router.post('/',authorize('buyer'),asyncHandler(async(req,res)=>{
 const parsed=create.safeParse(req.body);if(!parsed.success)throw new AppError('Provide a valid enquiry, time, timezone and submission key.',400);
 const body=parsed.data,timing=interval(body);
 if(+timing.start<=Date.now())throw new AppError('Choose a future appointment time.',400);
 const enquiry=await Enquiry.findOne({_id:body.enquiry,buyer:req.user.id});if(!enquiry)throw new AppError('Enquiry not found.',404);
 const record=await withCalendarLock(enquiry.dealer,async session=>{
  const prior=await Appointment.findOne({owner:enquiry.dealer,requestKey:body.requestKey}).session(session);
  if(prior){if(!prior.buyerRequest||String(prior.customer)!==req.user.id||String(prior.enquiry)!==body.enquiry||+prior.start!==+timing.start||+prior.end!==+timing.end||prior.buyerMessage!==body.message||prior.timeZone!==timing.timeZone)throw new AppError('Submission key already used with different details.',409);return prior;}
  // Touch vehicle and seller to serialize eligibility against concurrent disable/unpublish/suspension.
  const car=await Car.findOneAndUpdate({_id:enquiry.car,dealer:enquiry.dealer,testDriveAvailable:true,soldAt:null,isPublished:true,isDemo:{$ne:true},publicationHold:{$in:['',null]}},{$inc:{requestRevision:1}},{returnDocument:'after',session});
  const dealer=await Profile.findOneAndUpdate({user:enquiry.dealer,status:'approved'},{$inc:{publicationVersion:1}},{returnDocument:'after',session});
  const eligibility=testDriveEligibility(car,dealer);if(!eligibility.eligible)throw new AppError(eligibility.reason,409);
  if(await Appointment.exists({buyerRequest:true,customer:req.user.id,vehicle:enquiry.car,status:{$in:['requested','reschedule-proposed','scheduled']}}).session(session))throw new AppError('You already have an active request for this vehicle. Open it to manage the appointment.',409);
  if(await Appointment.exists({owner:enquiry.dealer,...overlap(timing.start,timing.end)}).session(session))throw new AppError('That time is unavailable. Choose a different time; private calendar details are not shared.',409);
  const [created]=await Appointment.create([{owner:enquiry.dealer,ownerRole:'dealer',customer:req.user.id,vehicle:enquiry.car,enquiry:enquiry._id,buyerRequest:true,requestKey:body.requestKey,title:enquiry.vehicleTitle,type:'test-drive',...timing,buyerMessage:body.message,status:'requested'}],{session});return created;
 });res.status(201).json({data:view(record)});
}));
router.put('/:id',asyncHandler(async(req,res)=>{
 const parsed=change.safeParse(req.body);if(!id.safeParse(req.params.id).success||!parsed.success)throw new AppError('Provide a valid action, version and appointment time.',400);
 const body=parsed.data,prior=await Appointment.findOne({_id:req.params.id,...scope(req)});if(!prior)throw new AppError('Request not found.',404);
 const record=await withCalendarLock(prior.owner,async session=>{
  const a=await Appointment.findOne({_id:prior._id,...scope(req)}).session(session);
  if(a.__v!==body.expectedVersion)throw new AppError('This request changed. Reload before updating.',409);
  const dealer=req.user.role==='dealer';
  const allowed={confirm:dealer&&a.status==='requested',decline:dealer&&['requested','reschedule-proposed'].includes(a.status),'propose-reschedule':dealer&&['requested','scheduled','reschedule-proposed'].includes(a.status),'accept-reschedule':!dealer&&a.status==='reschedule-proposed',cancel:['requested','scheduled','reschedule-proposed'].includes(a.status),complete:dealer&&a.status==='scheduled'};
  if(!allowed[body.action])throw new AppError('This action is not permitted for the current request state.',409);
  if(body.action==='propose-reschedule'){const t=interval(body);if(+t.start<=Date.now())throw new AppError('Choose a future time.',400);if(a.status==='scheduled'){a.reservedStart=a.start;a.reservedEnd=a.end;a.reservedTimeZone=a.timeZone;}Object.assign(a,t);}
  if(['confirm','accept-reschedule','propose-reschedule'].includes(body.action)&&+a.start<=Date.now())throw new AppError('The proposed time has passed. Propose a future time.',409);
  const status={confirm:'scheduled',decline:'declined','propose-reschedule':'reschedule-proposed','accept-reschedule':'scheduled',cancel:'cancelled',complete:'completed'}[body.action];
  if(['scheduled','reschedule-proposed'].includes(status)&&await Appointment.exists({_id:{$ne:a._id},owner:a.owner,...overlap(a.start,a.end)}).session(session))throw new AppError('That time conflicts with another appointment. Choose another time.',409);
  if(status==='completed'){if(!body.update)throw new AppError('Record a buyer-visible outcome.',400);a.publicOutcome=body.update;}
  if(status!=='reschedule-proposed'){a.reservedStart=null;a.reservedEnd=null;a.reservedTimeZone=null;}a.publicUpdate=body.update;a.status=status;await a.save({session});return a;
 });res.json({data:view(record)});
}));
module.exports=router;
