const {createMailTransport} = require('./mailTransport');
function mailConfigured(env = process.env) {
  return !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD && env.MAIL_FROM && env.PUBLIC_WEB_URL);
}
async function sendAccountMail({ to, kind, token }) {
  if (!mailConfigured()) return false;
  const base = new URL(process.env.PUBLIC_WEB_URL);
  if (process.env.NODE_ENV === 'production' && base.protocol !== 'https:') throw new Error('PUBLIC_WEB_URL requires HTTPS');
  const link = new URL(kind === 'reset' ? '/reset-password' : '/verify-email', base);
  link.hash = token;
  const transport = createMailTransport();
  try {
    await transport.sendMail({ from: process.env.MAIL_FROM, to,
      subject: kind === 'reset' ? 'Reset your Veltrenne password' : 'Verify your Veltrenne email',
      text: `${kind === 'reset' ? 'Reset your password' : 'Verify your email address'} using this single-use link:\n\n${link.href}\n\nThis link expires in ${kind === 'reset' ? '30 minutes' : '24 hours'}. If you did not request it, ignore this email.`,
    });
    return true;
  } finally { transport.close(); }
}
module.exports = { mailConfigured, sendAccountMail };
