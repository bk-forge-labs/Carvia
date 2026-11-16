const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
function load(name,dependencies={}) {
 const context={exports:{},Intl,Date,Map,require:key=>dependencies[key]};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/lib/workspace/'+name+'.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,context);
 return context.exports;
}
const {calendarEntries}=load('calendarEntries',{'./time':load('time')});
const record={_id:'appointment',status:'reschedule-proposed',start:'2028-06-04T08:00Z',end:'2028-06-04T09:00Z',reservedStart:'2028-04-03T22:00Z',reservedEnd:'2028-04-04T00:00Z'};
test('original reservation and proposed time remain visible across months in display timezone',()=>{
 const entries=calendarEntries([record],'Europe/Berlin');
 assert.equal(entries.get('2028-04-04')[0].calendarSlot,'reserved');
 assert.equal(entries.get('2028-04-04')[0].start,record.reservedStart);
 assert.equal(entries.get('2028-06-04')[0].calendarSlot,'primary');
 assert.equal(record.start,'2028-06-04T08:00Z');
 assert.equal(entries.has('2028-04-03'),false);
});
test('same-day slots have distinct identities and midnight end does not add another day',()=>{
 const entries=calendarEntries([{...record,start:'2028-04-03T20:00Z',end:'2028-04-03T22:00Z',reservedStart:'2028-04-03T18:00Z',reservedEnd:'2028-04-03T19:00Z'}],'Europe/Berlin');
 assert.equal(entries.get('2028-04-03').length,2);
 assert.equal(entries.has('2028-04-04'),false);
 assert.equal(new Set(entries.get('2028-04-03').map(a=>a._id+'-'+a.calendarSlot)).size,2);
 assert.equal(calendarEntries([{...record,status:'cancelled'}],'Europe/Berlin').has('2028-04-04'),false);
});
