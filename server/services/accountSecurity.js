const { randomBytes, createHash } = require('node:crypto');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/AppError');
const digest = token => createHash('sha256').update(token).digest('hex');
function passwordInput(password) {
  if (typeof password !== 'string' || password.length < 12 || Buffer.byteLength(password, 'utf8') > 72) {
    throw new AppError('Use a password of at least 12 characters and no more than 72 UTF-8 bytes.', 400);
  }
  return password;
}
function createAccountSecurity({ User, Token, transaction, send }) {
  return {
    async issue(user, kind) {
      if (!user) return;
      const existing = await Token.findOne({ user: user._id, kind });
      if (existing && Date.now() - new Date(existing.updatedAt).getTime() < 60000) return;
      const token = randomBytes(32).toString('hex');
      const stored = await Token.findOneAndUpdate({ user: user._id, kind }, { $set: {
        digest: digest(token), expiresAt: new Date(Date.now() + (kind === 'reset' ? 1800000 : 86400000))
      } }, { upsert: true, new: true });
      try { if (!await send({ to: user.email, kind, token })) await Token.deleteOne({ _id: stored._id, digest: digest(token) }); }
      catch { await Token.deleteOne({ _id: stored._id, digest: digest(token) }); console.error('Account email delivery failed; check mail service configuration.'); }
    },
    async consume(kind, token, password) {
      if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) throw new AppError('This link is invalid or expired. Request a new one.', 400);
      const hash = kind === 'reset' ? await bcrypt.hash(passwordInput(password), 12) : null;
      return transaction(async session => {
        const record = await Token.findOneAndDelete({ kind, digest: digest(token), expiresAt: { $gt: new Date() } }, { session });
        if (!record) throw new AppError('This link is invalid or expired. Request a new one.', 400);
        const changes = kind === 'reset' ? { $set: { password: hash }, $inc: { authVersion: 1 } } : { $set: { emailVerifiedAt: new Date() } };
        const user = await User.findByIdAndUpdate(record.user, changes, { session, new: true });
        if (!user) throw new AppError('This account is unavailable.', 400);
        if (kind === 'reset') await Token.deleteMany({ user: record.user, kind: 'reset' }, { session });
        return user;
      });
    },
    async change(userId, currentPassword, newPassword) {
      passwordInput(newPassword);
      if (typeof currentPassword !== 'string' || currentPassword.length > 1024) throw new AppError('Enter your current password.', 400);
      const user = await User.findById(userId).select('+password authVersion');
      if (!user || !await user.comparePassword(currentPassword)) throw new AppError('The current password is incorrect.', 400);
      const hash = await bcrypt.hash(newPassword, 12);
      await transaction(async session => {
        const updated = await User.findOneAndUpdate({ _id: userId, password: user.password }, { $set: { password: hash }, $inc: { authVersion: 1 } }, { session, new: true });
        if (!updated) throw new AppError('Your account changed. Sign in and try again.', 409);
        await Token.deleteMany({ user: userId, kind: 'reset' }, { session });
      });
    }
  };
}
module.exports = { createAccountSecurity, passwordInput, digest };
