const {createMailTransport,localSink} = require('./mailTransport');
function configured(env = process.env) {
  return !!(env.SMTP_HOST && env.MAIL_FROM && (localSink(env) || (env.SMTP_USER && env.SMTP_PASSWORD)));
}
function messageId(message) {
  const domain=(process.env.MAIL_FROM||'').match(/@([a-z0-9.-]+)/i)?.[1] || 'localhost';
  return `<workspace-${message._id}-${message.attempts}@${domain}>`;
}
async function send(message) {
  if (!configured()) {
    const error = new Error('Email provider is not configured. No message was sent.');
    error.definiteFailure = true;
    throw error;
  }
  const transport = createMailTransport({allowLocalSink:true,connectionTimeout:3000,greetingTimeout:3000,socketTimeout:7000});
  try {
    const result = await transport.sendMail({from: process.env.MAIL_FROM, to: message.recipient,
      subject: message.subject, text: message.text, messageId:message.messageId});
    if (!result.accepted?.length) {
      const error = new Error('The provider rejected the recipient.');
      error.definiteFailure = true;
      throw error;
    }
    return result.messageId || '';
  } catch (error) {
    error.definiteFailure = error.definiteFailure || error.responseCode >= 400 || ['EAUTH','ENOTFOUND','EAI_AGAIN'].includes(error.code) || ['ECONNREFUSED','ENOTFOUND'].includes(error.errno) || ['AUTH','MAIL FROM','RCPT TO'].includes(error.command);
    throw error;
  } finally {transport.close();}
}
module.exports = {configured, localSink, send, messageId};
