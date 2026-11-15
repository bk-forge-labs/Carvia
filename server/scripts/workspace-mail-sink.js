/** Local development SMTP sink. Never binds outside loopback or forwards mail. */
const net = require('node:net');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
function createSink({messages = [], mode = {reject:false, uncertain:false}, output} = {}) {
  return net.createServer(socket => {
    socket.setEncoding('utf8');
    let buffer = '', data = false, content = [];
    socket.write('220 localhost Veltrenne test mail sink\r\n');
    socket.on('data',chunk => {
      buffer += chunk;
      let end;
      while ((end = buffer.indexOf('\r\n')) >= 0) {
        const line = buffer.slice(0,end); buffer = buffer.slice(end+2);
        if (data) {
          if (line !== '.') {content.push(line.startsWith('..') ? line.slice(1) : line); continue;}
          const message = content.join('\r\n'); messages.push(message);
          if (output) fs.appendFileSync(output,JSON.stringify({receivedAt:new Date().toISOString(),message})+'\n');
          data = false; content = [];
          if (mode.uncertain) {socket.destroy(); return;}
          socket.write('250 2.0.0 Accepted by local test sink\r\n'); continue;
        }
        const command = line.split(' ')[0].toUpperCase();
        if (command === 'EHLO') socket.write('250-localhost\r\n250 8BITMIME\r\n');
        else if (command === 'HELO' || command === 'MAIL' || command === 'RSET' || command === 'NOOP') socket.write('250 OK\r\n');
        else if (command === 'RCPT') socket.write(mode.reject ? '550 5.1.1 Test rejection\r\n' : '250 OK\r\n');
        else if (command === 'DATA') {data=true; socket.write('354 End with a dot\r\n');}
        else if (command === 'QUIT') {socket.end('221 Bye\r\n'); return;}
        else socket.write('502 Not supported by test sink\r\n');
      }
    });
    socket.on('error',() => {});
  });
}
module.exports = {createSink};
if (require.main === module) {
  const output = process.env.WORKSPACE_SINK_FILE || path.join(os.tmpdir(),'veltrenne-test-mail.jsonl');
  createSink({output}).listen(Number(process.env.WORKSPACE_SINK_PORT || 2527),'127.0.0.1',() => console.log('Local-only mail sink ready; messages recorded at '+output));
}
