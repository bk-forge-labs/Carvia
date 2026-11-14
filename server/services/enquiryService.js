const AppError = require('../utils/AppError');
const validId = value => typeof value === 'string' && /^[a-f0-9]{24}$/i.test(value);
function validateInput(body) {
  if (!validId(body?.carId)) throw new AppError('Choose a valid vehicle.',400);
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (message.length < 20 || message.length > 1500) throw new AppError('Please write between 20 and 1,500 characters.',400);
  return {carId:body.carId,message};
}
function scope(user) {
  if (user.role === 'buyer') return {buyer:user.id};
  if (user.role === 'dealer') return {dealer:user.id};
  throw new AppError('This inbox is for buyers and dealers.',403);
}
function statusInput(body) {
  if (!['new','contacted','closed'].includes(body?.status) || !['new','contacted','closed'].includes(body?.previousStatus)) throw new AppError('Choose a valid enquiry status.',400);
  return {status:body.status,previousStatus:body.previousStatus};
}
module.exports = {validId,validateInput,scope,statusInput};
