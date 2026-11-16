const express = require('express');
const mongoose = require('mongoose');
const {z} = require('zod');
const {protect} = require('../middleware/authMiddleware');
const {authorize} = require('../middleware/roleMiddleware');
const AppError = require('../utils/AppError');
const Appointment = require('../models/Appointment');
const Task = require('../models/FollowUpTask');
const Message = require('../models/WorkspaceMessage');
const Car = require('../models/Car');
const Enquiry = require('../models/Enquiry');
const User = require('../models/User');
const Profile = require('../models/DealerProfile');
const {interval, resolveTime} = require('../services/workspaceTime');
const mail = require('../services/workspaceMail');
const {withCalendarLock} = require('../services/calendarLock');
const router = express.Router();
const emailLimit=require('express-rate-limit').rateLimit({windowMs:60000,limit:10,keyGenerator:req=>req.user.id,standardHeaders:'draft-8',legacyHeaders:false,message:{message:'Too many confirmation requests. Wait a minute and check email history before retrying.'}});
router.use(protect, authorize('dealer','admin'), (req,res,next) => {res.set('Cache-Control','no-store'); next();});
const id = z.string().regex(/^[a-f0-9]{24}$/i).transform(value=>value.toLowerCase());
const optionalId = id.nullable().optional();
const short = z.string().trim().min(1).max(160).refine(value=>!/[\x00-\x1f\x7f]/.test(value),'Use a single-line title without control characters.');
const zone = z.string().min(1).max(100);
const occurrence = z.enum(['','earlier','later']).optional();
const key = z.string().uuid();
const baseAppointment = {
  title: short, type: z.enum(['meeting','test-drive']),
  startLocal: z.string(), endLocal: z.string(), timeZone: zone,
  startOccurrence: occurrence, endOccurrence: occurrence,
  vehicle: optionalId, enquiry: optionalId, notes: z.string().trim().max(2000).default(''),
  acceptConflicts: z.boolean().default(false),
};
const createAppointment = z.object({...baseAppointment, requestKey:key, task:optionalId}).strict();
const editAppointment = z.object({...baseAppointment, expectedVersion:z.number().int().min(0),
  status:z.enum(['scheduled','cancelled','completed']), outcome:z.string().trim().max(2000).default('')}).strict();
const taskInput = {
  title: short, dueLocal:z.string(), timeZone:zone, dueOccurrence:occurrence,
  enquiry:optionalId, vehicle:optionalId, appointment:optionalId,
  notes:z.string().trim().max(2000).default(''), status:z.enum(['open','in-progress','done','cancelled']).default('open'),
};
const createTask = z.object({...taskInput,requestKey:key}).strict();
const editTask = z.object({...taskInput,expectedVersion:z.number().int().min(0)}).strict();
const owned = (req) => ({owner:req.user.id, ownerRole:req.user.role});
const route = fn => async(req,res,next) => {
  try {await fn(req,res);}
  catch(error) {
    if (error.statusCode && error.statusCode < 500) return res.status(error.statusCode).json({message:error.message, ...(error.details || {})});
    next(error);
  }
};
function parse(schema, value) {
  const result = schema.safeParse(value);
  if (!result.success) throw new AppError(result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; '),400);
  return result.data;
}
function recordId(req) {return parse(id,req.params.id);}
async function links(req, body) {
  let enquiry = null, vehicle = body.vehicle || null, enquiryId=body.enquiry || null;
  if(body.appointment) {
    const appointment=await Appointment.findOne({_id:body.appointment,...owned(req)});
    if(!appointment) throw new AppError('Appointment unavailable or outside your calendar.',404);
    if(enquiryId && appointment.enquiry && enquiryId!==String(appointment.enquiry)) throw new AppError('The enquiry must match the linked appointment.',400);
    if(vehicle && appointment.vehicle && vehicle!==String(appointment.vehicle)) throw new AppError('The vehicle must match the linked appointment.',400);
    enquiryId=enquiryId || (appointment.enquiry && String(appointment.enquiry));
    vehicle=vehicle || (appointment.vehicle && String(appointment.vehicle));
  }
  if (enquiryId) {
    if (req.user.role !== 'dealer') throw new AppError('Administrator scheduling does not grant access to private dealer enquiries.',403);
    enquiry = await Enquiry.findOne({_id:enquiryId,dealer:req.user.id});
    if (!enquiry) throw new AppError('Enquiry unavailable or outside your workspace.',404);
    if (!vehicle) vehicle = String(enquiry.car);
    if (vehicle !== String(enquiry.car)) throw new AppError('The vehicle must match the linked enquiry.',400);
  }
  if (vehicle) {
    const car = await Car.findOne({_id:vehicle,...(req.user.role === 'dealer' ? {dealer:req.user.id} : {})});
    if (!car) throw new AppError('Vehicle unavailable or outside your workspace.',404);
  }
  return {enquiry:enquiry?._id || null, vehicle, ...(enquiry ? {customer:enquiry.buyer} : {customer:null})};
}
const serializeCalendar = (req,operation) => withCalendarLock(req.user.id,operation);
async function saveAppointment(req, body, recordIdValue) {
  const prior = recordIdValue && await Appointment.findOne({_id:recordIdValue,...owned(req)});
  if (prior?.buyerRequest) throw new AppError('Use the connected request actions to update this buyer appointment.',409);
  if (recordIdValue && !prior) throw new AppError('Appointment unavailable or outside your calendar.',404);
  if(prior && body.status!=='scheduled' && ['vehicle','enquiry'].some(field=>String(prior[field]||'')!==String(body[field]||''))) throw new AppError('Cancellation or completion keeps the original linked records. Save link changes separately first.',400);
  const linked = prior && body.status !== 'scheduled'
    ? {enquiry:prior.enquiry,vehicle:prior.vehicle,customer:prior.customer}
    : await links(req,body);
  const times = interval(body);
  return serializeCalendar(req,async session => {
    let record;
    if (recordIdValue) {
      record = await Appointment.findOne({_id:recordIdValue,...owned(req)}).session(session);
      if (!record) throw new AppError('Appointment unavailable or outside your calendar.',404);
      if (record.__v !== body.expectedVersion) throw new AppError('This appointment changed. Reload before saving.',409);
      if (record.status !== 'scheduled') throw new AppError('Cancelled or completed appointments cannot be edited or reopened. Create a new appointment.',400);
    } else {
      const existing = await Appointment.findOne({...owned(req),requestKey:body.requestKey}).session(session);
      if (existing) {
        if (existing.title!==body.title || +existing.start!==+times.start || +existing.end!==+times.end || existing.type!==body.type || existing.timeZone!==body.timeZone || existing.notes!==body.notes || String(existing.enquiry||'')!==String(linked.enquiry||'') || String(existing.vehicle||'')!==String(linked.vehicle||'') || String(existing.followUpTask||'')!==String(body.task||'')) throw new AppError('This submission was already saved with different details. Reload before creating another appointment.',409);
        return existing;
      }
      record = new Appointment({...owned(req),requestKey:body.requestKey,followUpTask:body.task || null});
      if(body.task) {
        const task=await Task.findOne({_id:body.task,...owned(req)}).session(session);
        if(!task) throw new AppError('Follow-up task unavailable or outside your workspace.',404);
        if(task.appointment) throw new AppError('This follow-up already has an appointment. Open that appointment or schedule without this task.',409);
        if(task.enquiry && String(task.enquiry)!==String(linked.enquiry||'')) throw new AppError('The appointment must match the follow-up enquiry.',400);
        if(task.vehicle && String(task.vehicle)!==String(linked.vehicle||'')) throw new AppError('The appointment must match the follow-up vehicle.',400);
        task.appointment=record._id;
        await task.save({session});
      }
    }
    const status = body.status || 'scheduled';
    const conflicts = status === 'scheduled' ? await Appointment.find({
      ...owned(req),...require('../services/calendarLock').overlap(times.start,times.end),
      ...(recordIdValue ? {_id:{$ne:recordIdValue}} : {}),
    }).select('title start end status reservedStart reservedEnd').session(session) : [];
    if (conflicts.length && !body.acceptConflicts) {
      const error = new AppError('This overlaps another appointment. Review the conflicts and explicitly allow overlap to save.',409);
      error.details = {conflicts:conflicts.map(item=>({_id:item._id,title:item.title,start:item.status==='reschedule-proposed'?item.reservedStart:item.start,end:item.status==='reschedule-proposed'?item.reservedEnd:item.end}))};
      throw error;
    }
    if (status === 'completed' && !body.outcome?.trim()) throw new AppError('Record an outcome before completing the appointment.',400);
    Object.assign(record, times, linked, {title:body.title,type:body.type,notes:body.notes,status,outcome:body.outcome || ''});
    await record.save({session});
    return record;
  });
}
router.get('/options',route(async(req,res) => {
  const [vehicles,enquiries,appointments] = await Promise.all([
    Car.find(req.user.role === 'dealer' ? {dealer:req.user.id} : {}).select('title').sort({createdAt:-1}).limit(101).lean(),
    req.user.role === 'dealer' ? Enquiry.find({dealer:req.user.id}).select('vehicleTitle buyer car status').populate('buyer','name').sort({createdAt:-1}).limit(101).lean() : [],
    Appointment.find(owned(req)).select('title').sort({start:-1}).limit(101).lean(),
  ]);
  res.json({vehicles:vehicles.slice(0,100),enquiries:enquiries.slice(0,100),appointments:appointments.slice(0,100),truncated:vehicles.length>100 || enquiries.length>100 || appointments.length>100,mailAvailable:mail.configured()});
}));
router.get('/appointments',route(async(req,res) => {
  const from = new Date(typeof req.query.from === 'string' ? req.query.from : '');
  const to = new Date(typeof req.query.to === 'string' ? req.query.to : '');
  if (!Number.isFinite(+from) || !Number.isFinite(+to) || to <= from || to-from > 63*86400000) throw new AppError('Choose a date range of up to 63 days.',400);
  const data = await Appointment.find({...owned(req),$or:[{start:{$lt:to},end:{$gt:from}},{status:'reschedule-proposed',reservedStart:{$lt:to},reservedEnd:{$gt:from}}]}).sort({start:1}).limit(501);
  res.json({data:data.slice(0,500),truncated:data.length>500});
}));
router.post('/appointments',route(async(req,res) => res.status(201).json({data:await saveAppointment(req,parse(createAppointment,req.body))})));
router.get('/appointments/:id',route(async(req,res) => {
  const data = await Appointment.findOne({_id:recordId(req),...owned(req)});
  if (!data) throw new AppError('Appointment unavailable or outside your calendar.',404);
  res.json({data});
}));
router.put('/appointments/:id',route(async(req,res) => res.json({data:await saveAppointment(req,parse(editAppointment,req.body),recordId(req))})));
router.get('/tasks',route(async(req,res) => {
  const page = Math.max(1,Math.min(10000,Math.floor(Number(req.query.page))||1));
  const filter = {...owned(req)};
  if (req.query.status) filter.status = parse(z.enum(['open','in-progress','done','cancelled']),req.query.status);
  const [data,total] = await Promise.all([Task.find(filter).sort({dueAt:1}).skip((page-1)*25).limit(25),Task.countDocuments(filter)]);
  res.json({data,page,pages:Math.ceil(total/25),total});
}));
async function saveTask(req,body,recordIdValue) {
  const prior=recordIdValue && await Task.findOne({_id:recordIdValue,...owned(req)});
  if(recordIdValue && !prior) throw new AppError('Task unavailable or outside your workspace.',404);
  const unchangedLinks=prior && ['enquiry','vehicle','appointment'].every(field=>String(prior[field]||'')===String(body[field]||''));
  const linked=unchangedLinks?{enquiry:prior.enquiry,vehicle:prior.vehicle}:await links(req,body);
  const dueAt = resolveTime(body.dueLocal,body.timeZone,body.dueOccurrence);
  const replay = existing => {
    if(!existing || existing.title!==body.title || +existing.dueAt!==+dueAt || existing.timeZone!==body.timeZone || existing.notes!==body.notes || existing.status!==body.status || ['enquiry','vehicle','appointment'].some(field=>String(existing[field]||'')!==String(field==='appointment'?body.appointment||'':linked[field]||''))) throw new AppError('This submission was already saved with different details. Reload before creating another task.',409);
    return existing;
  };
  let record;
  if (recordIdValue) {
    record = prior;
    if (!record) throw new AppError('Task unavailable or outside your workspace.',404);
    if (record.__v !== body.expectedVersion) throw new AppError('This task changed. Reload before saving.',409);
  } else {
    record = await Task.findOne({...owned(req),requestKey:body.requestKey});
    if (record) return replay(record);
    record = new Task({...owned(req),requestKey:body.requestKey});
  }
  Object.assign(record,{title:body.title,notes:body.notes,status:body.status,dueAt,timeZone:body.timeZone,
    enquiry:linked.enquiry,vehicle:linked.vehicle,appointment:body.appointment || null});
  try {return await record.save();}
  catch(error) {if(error.code===11000 && !recordIdValue) return replay(await Task.findOne({...owned(req),requestKey:body.requestKey})); throw error;}
}
router.post('/tasks',route(async(req,res) => res.status(201).json({data:await saveTask(req,parse(createTask,req.body))})));
router.put('/tasks/:id',route(async(req,res) => res.json({data:await saveTask(req,parse(editTask,req.body),recordId(req))})));
router.get('/messages',route(async(req,res) => {
  const page = Math.max(1,Math.min(10000,Math.floor(Number(req.query.page))||1));
  const filter = {owner:req.user.id};
  if (req.query.appointment) filter.appointment = parse(id,req.query.appointment);
  const [data,total] = await Promise.all([Message.find(filter).sort({createdAt:-1}).skip((page-1)*25).limit(25),Message.countDocuments(filter)]);
  res.json({data,page,pages:Math.ceil(total/25),total,mailAvailable:mail.configured()});
}));
router.post('/appointments/:id/confirmation',emailLimit,route(async(req,res) => {
  const body = parse(z.object({expectedVersion:z.number().int().min(0),retryFailed:z.boolean().default(false),expectedAttempts:z.number().int().min(0).optional()}).strict(),req.body);
  if (body.retryFailed && body.expectedAttempts == null) throw new AppError('Refresh the email status before retrying.',400);
  const appointment = await Appointment.findOne({_id:recordId(req),...owned(req)});
  if (!appointment) throw new AppError('Appointment unavailable or outside your calendar.',404);
  if (appointment.buyerRequest && !['scheduled','cancelled','completed'].includes(appointment.status)) throw new AppError('A pending or declined request is not a confirmed appointment.',409);
  if (appointment.buyerRequest && !mail.localSink()) throw new AppError('Buyer-journey email is restricted to the local test sink until production sending is authorized.',403);
  if (appointment.__v !== body.expectedVersion) throw new AppError('The appointment changed. Reload before sending.',409);
  if (req.user.role !== 'dealer' || !await Profile.exists({user:req.user.id,status:'approved'})) throw new AppError('Confirmation email requires an approved dealer and a linked buyer enquiry.',403);
  if (!appointment.enquiry) throw new AppError('Link an authorized buyer enquiry before sending confirmation.',400);
  const enquiry = await Enquiry.findOne({_id:appointment.enquiry,dealer:req.user.id});
  const customer = enquiry && await User.findById(enquiry.buyer).select('email name');
  if (!customer) throw new AppError('The linked customer is unavailable. No email was sent.',404);
  const date = value => new Intl.DateTimeFormat('en-GB',{dateStyle:'full',timeStyle:'long',timeZone:appointment.timeZone}).format(value);
  const filter = {owner:req.user.id,appointment:appointment._id,appointmentVersion:appointment.__v};
  let message;
  if(body.retryFailed) {
    message=await Message.findOne(filter);
    if(!message) throw new AppError('No failed message exists for this appointment version.',404);
  } else try {
    message = await Message.findOneAndUpdate(filter,{$setOnInsert:{
      recipient:customer.email,subject:`Veltrenne: ${appointment.status === 'cancelled' ? 'Cancelled' : appointment.status === 'completed' ? 'Outcome' : 'Appointment confirmation'} — ${appointment.title}`,
      text:`Hello ${customer.name},\n\n${appointment.title}\nType: ${appointment.type==='test-drive'?'Test drive':'Meeting'}\nStatus: ${appointment.status}\nStart: ${date(appointment.start)}\nEnd: ${date(appointment.end)}\nTimezone: ${appointment.timeZone}\n${appointment.status==='completed' && (appointment.buyerRequest?appointment.publicOutcome:appointment.outcome) ? 'Outcome: '+(appointment.buyerRequest?appointment.publicOutcome:appointment.outcome)+'\n' : ''}\nPlease contact your dealer with any questions.\nVeltrenne`,
    }},{upsert:true,returnDocument:'after'});
  } catch(error) {if(error.code!==11000) throw error; message=await Message.findOne(filter);}
  if (body.retryFailed) await Message.updateOne({_id:message._id,state:'failed',attempts:body.expectedAttempts},{$set:{state:'queued',failure:''}});
  const claimed = await Message.findOneAndUpdate({_id:message._id,state:'queued'},{$set:{state:'sending'},$inc:{attempts:1}},{returnDocument:'after'});
  if (claimed) {
    try {
      claimed.messageId=mail.messageId(claimed);
      await Message.updateOne({_id:claimed._id,state:'sending'},{$set:{messageId:claimed.messageId}});
      const messageId = await mail.send(claimed);
      await Message.updateOne({_id:claimed._id,state:'sending'},{$set:{state:'provider-accepted',messageId,acceptedAt:new Date()}});
    } catch(error) {
      await Message.updateOne({_id:claimed._id,state:'sending'},{$set:{
        state:error.definiteFailure ? 'failed' : 'unknown',
        failure:error.definiteFailure ? 'The provider did not accept this email. Check configuration or recipient before explicitly retrying.' : 'Acceptance is uncertain. Investigate with the provider; automatic resend is disabled to avoid duplicates.',
      }});
    }
  }
  res.json({data:await Message.findById(message._id)});
}));
module.exports = router;
