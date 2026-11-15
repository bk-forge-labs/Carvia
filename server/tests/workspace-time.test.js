const test = require('node:test');
const assert = require('node:assert/strict');
const {resolveTime,interval,wallTime} = require('../services/workspaceTime');
test('calendar rejects impossible dates, spring gaps and invalid zones',() => {
  for (const [local,zone] of [['2026-02-30T12:00','Europe/Berlin'],['2026-03-29T02:30','Europe/Berlin'],['2026-01-01T10:00','Bad/Zone']]) {
    assert.throws(() => resolveTime(local,zone),e=>e.statusCode===400);
  }
});
test('calendar requires explicit repeated-hour choice and stores distinct UTC instants',() => {
  assert.throws(()=>resolveTime('2026-10-25T02:30','Europe/Berlin'),/occurs twice/);
  assert.equal(resolveTime('2026-10-25T02:30','Europe/Berlin','earlier').toISOString(),'2026-10-25T00:30:00.000Z');
  assert.equal(resolveTime('2026-10-25T02:30','Europe/Berlin','later').toISOString(),'2026-10-25T01:30:00.000Z');
});
test('calendar handles quarter-hour zones and day/year boundaries',() => {
  assert.equal(resolveTime('2027-01-01T00:15','Asia/Kathmandu').toISOString(),'2026-12-31T18:30:00.000Z');
  assert.equal(wallTime(new Date('2026-12-31T18:30Z'),'Asia/Kathmandu'),'2027-01-01T00:15');
});
test('appointment intervals compare instants across DST and reject reversed or excessive durations',() => {
  const result = interval({startLocal:'2026-03-29T01:30',endLocal:'2026-03-29T03:30',timeZone:'Europe/Berlin'});
  assert.equal(result.end-result.start,3600000);
  for (const endLocal of ['2026-03-29T01:00','2026-03-31T03:30']) {
    assert.throws(()=>interval({startLocal:'2026-03-29T01:30',endLocal,timeZone:'Europe/Berlin'}),e=>e.statusCode===400);
  }
});
test('local mail sink cannot disable TLS in production or for non-loopback hosts',() => {
  const {localSink} = require('../services/mailTransport');
  assert.equal(localSink({NODE_ENV:'production',WORKSPACE_MAIL_SINK:'true',SMTP_HOST:'127.0.0.1'}),false);
  assert.equal(localSink({WORKSPACE_MAIL_SINK:'true',SMTP_HOST:'smtp.example.com'}),false);
  assert.equal(localSink({WORKSPACE_MAIL_SINK:'true',SMTP_HOST:'127.0.0.1'}),true);
});
