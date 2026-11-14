const AppError = require('./AppError');
function authInput(body, registering = false) {
  if (!body || typeof body.email !== 'string' || typeof body.password !== 'string') throw new AppError('Email and password are required.', 400);
  const email = body.email.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new AppError('Enter a valid email address.', 400);
  if (!body.password.length || body.password.length > 1024) throw new AppError('Enter a valid password.', 400);
  if (registering && (body.password.length < 12 || Buffer.byteLength(body.password, 'utf8') > 72)) throw new AppError('Use a password of at least 12 characters and no more than 72 UTF-8 bytes.', 400);
  if (registering && (typeof body.name !== 'string' || body.name.trim().length < 2 || body.name.trim().length > 50)) throw new AppError('Use a name between 2 and 50 characters.', 400);
  return {email, password: body.password, name: registering ? body.name.trim() : undefined, role: body.role === 'dealer' ? 'dealer' : 'buyer'};
}
module.exports = {authInput};
