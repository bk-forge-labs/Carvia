const Enquiry = require('../models/Enquiry');
const Car = require('../models/Car');
const DealerProfile = require('../models/DealerProfile');
const {validId,validateInput,scope,statusInput} = require('../services/enquiryService');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
exports.create = asyncHandler(async (req,res) => {
  if ((process.env.NODE_ENV === 'production' || process.env.REQUIRE_VERIFIED_EMAIL === 'true') && !req.user.emailVerifiedAt) throw new AppError('Verify your email address in Manage account before sending an enquiry.', 403);
  const {carId,message} = validateInput(req.body);
  const existing = await Enquiry.findOne({buyer:req.user.id,car:carId}).select('_id');
  if (existing) return res.json({id:existing.id,alreadyExists:true});
  const car = await Car.findOne({_id:carId,isPublished:true,isDemo:{$ne:true},publicationHold:{$in:['',null]}}).select('title dealer').lean();
  if (!car) throw new AppError('This vehicle is no longer available for enquiries.',404);
  const dealer = await DealerProfile.findOne({user:car.dealer,status:'approved'}).select('companyName').lean();
  if (!dealer) throw new AppError('This seller is not currently accepting enquiries.',409);
  try {
    const enquiry = await Enquiry.create({car:car._id,buyer:req.user.id,dealer:car.dealer,vehicleTitle:car.title,dealerName:dealer.companyName,message});
    return res.status(201).json({id:enquiry.id,alreadyExists:false});
  } catch(error) {
    if (error.code === 11000) {
      const saved = await Enquiry.findOne({buyer:req.user.id,car:carId}).select('_id');
      if(saved) return res.json({id:saved.id,alreadyExists:true});
    }
    throw new AppError('Could not save your enquiry. Please try again.',500);
  }
});
exports.list = asyncHandler(async (req,res) => {
  res.set('Cache-Control','no-store');
  const page = Math.max(1,Math.min(10000,parseInt(req.query.page,10)||1));
  const filter = scope(req.user);
  const [records,total] = await Promise.all([
    Enquiry.find(filter).sort({createdAt:-1,_id:-1}).skip((page-1)*20).limit(20).populate('buyer','name email').populate('car','isPublished publicationHold').lean(),
    Enquiry.countDocuments(filter)
  ]);
  const data = records.map(e => ({id:String(e._id),carId:e.car?String(e.car._id):null,available:!!e.car?.isPublished&&!e.car?.publicationHold,vehicleTitle:e.vehicleTitle,dealerName:e.dealerName,message:e.message,status:e.status,createdAt:e.createdAt,updatedAt:e.updatedAt,...(req.user.role==='dealer'?{buyerName:e.buyer?.name||'Account unavailable',buyerEmail:e.buyer?.email||null}:{})}));
  res.json({data,total,page,pages:Math.ceil(total/20)});
});
exports.update = asyncHandler(async (req,res) => {
  if (!validId(req.params.id)) throw new AppError('Enquiry not found.',404);
  const {status,previousStatus} = statusInput(req.body);
  const enquiry = await Enquiry.findOneAndUpdate({_id:req.params.id,dealer:req.user.id,status:previousStatus},{$set:{status}},{new:true,runValidators:true}).select('status updatedAt');
  if (!enquiry) {
    if (!await Enquiry.exists({_id:req.params.id,dealer:req.user.id})) throw new AppError('Enquiry not found.',404);
    throw new AppError('This enquiry changed in another window. Refresh before updating it.',409);
  }
  res.json({status:enquiry.status,updatedAt:enquiry.updatedAt});
});

exports.summary = asyncHandler(async (req,res) => {
  res.set('Cache-Control','no-store');
  const newCount = await Enquiry.countDocuments({...scope(req.user),status:'new'});
  res.json({newCount});
});
