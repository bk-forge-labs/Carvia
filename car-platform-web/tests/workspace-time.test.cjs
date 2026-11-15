const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const context={exports:{},Intl,Date};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/lib/workspace/time.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,context);
const {calendarDays,localTime,occurrenceFor,addDays}=context.exports;
test('calendar weeks are Monday first across year boundaries and months include leap day',()=>{
  const week=calendarDays('2027-01-01','week');assert.equal(week.length,7);assert.equal(week[0],'2026-12-28');assert.equal(week[6],'2027-01-03');
  const month=calendarDays('2028-02-29','month');assert.equal(month.length,42);assert.equal(month[0],'2028-01-31');assert(month.includes('2028-02-29'));
  assert.equal(calendarDays('2028-02-29','day')[0],'2028-02-29');assert.equal(addDays('2028-02-28',1),'2028-02-29');
});
test('editing an existing repeated-hour appointment preserves its occurrence',()=>{
  assert.equal(localTime('2026-12-31T23:30:00Z','Europe/Berlin'),'2027-01-01T00:30');
  assert.equal(localTime('2026-10-25T00:30:00Z','Europe/Berlin'),'2026-10-25T02:30');
  assert.equal(occurrenceFor('2026-10-25T00:30:00Z','Europe/Berlin'),'earlier');
  assert.equal(occurrenceFor('2026-10-25T01:30:00Z','Europe/Berlin'),'later');
  assert.equal(occurrenceFor('2026-04-04T14:45:00Z','Australia/Lord_Howe'),'earlier');
  assert.equal(occurrenceFor('2026-04-04T15:15:00Z','Australia/Lord_Howe'),'later');
});
