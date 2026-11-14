const mongoose = require('mongoose');
const User = require('../models/User');
const Token = require('../models/AccountToken');
const { createAccountSecurity } = require('../services/accountSecurity');
const { mailConfigured, sendAccountMail } = require('../services/accountMail');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const security = createAccountSecurity({ User, Token, transaction: fn => mongoose.connection.transaction(fn), send: sendAccountMail });
exports.security = security;
exports.status = (req, res) => res.json({ emailVerified: !!req.user.emailVerifiedAt, emailDeliveryAvailable: mailConfigured() });
exports.forgot = asyncHandler(async (req, res) => {
  if (!mailConfigured()) throw new AppError('Password recovery email is not available yet. Please try again later.', 503);
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  if (!email || email.length > 254) throw new AppError('Enter your email address.', 400);
  const user = await User.findOne({ email });
  await security.issue(user, 'reset');
  res.status(202).json({ message: 'If an account matches that address, a password reset link will be sent. Check your inbox and spam folder.' });
});
exports.requestVerification = asyncHandler(async (req, res) => {
  if (!mailConfigured()) throw new AppError('Verification email is not available yet. Please try again later.', 503);
  if (!req.user.emailVerifiedAt) await security.issue(await User.findById(req.user.id), 'verify');
  res.status(202).json({ message: 'If verification is needed, a link will be sent to your account email. Check your inbox and spam folder.' });
});
exports.verify = asyncHandler(async (req, res) => {
  await security.consume('verify', req.body?.token);
  res.json({ message: 'Your email address is verified.' });
});
exports.reset = asyncHandler(async (req, res) => {
  await security.consume('reset', req.body?.token, req.body?.password);
  res.clearCookie('access_token', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  res.json({ message: 'Your password has been reset. Sign in with your new password.' });
});
exports.change = asyncHandler(async (req, res) => {
  await security.change(req.user.id, req.body?.currentPassword, req.body?.password);
  res.clearCookie('access_token', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  res.json({ message: 'Password changed. All previous sessions have been signed out.' });
});
