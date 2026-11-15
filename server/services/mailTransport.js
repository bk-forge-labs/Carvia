const nodemailer = require('nodemailer');
function localSink(env = process.env) {
  return env.NODE_ENV !== 'production' && env.WORKSPACE_MAIL_SINK === 'true' && ['127.0.0.1','localhost'].includes(env.SMTP_HOST);
}
function createMailTransport({allowLocalSink = false, connectionTimeout=10000, greetingTimeout=10000, socketTimeout=15000} = {}) {
  const sink = allowLocalSink && localSink();
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 465),
    secure: !sink && (process.env.SMTP_PORT || '465') === '465', requireTLS: !sink,
    ...(sink ? {} : {auth: {user:process.env.SMTP_USER,pass:process.env.SMTP_PASSWORD}}),
    connectionTimeout,greetingTimeout,socketTimeout,
  });
}
module.exports = {createMailTransport,localSink};
