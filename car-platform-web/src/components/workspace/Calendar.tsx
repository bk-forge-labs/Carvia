'use client';
import {useMemo,useState,type FormEvent} from 'react';
import {useSearchParams,useRouter} from 'next/navigation';
import Link from 'next/link';
import {useQuery,useQueryClient} from '@tanstack/react-query';
import {api,ApiError} from '@/lib/api/browser';
import {useAuth} from '@/lib/store/auth';
import {addDays,calendarDays,clock,dayLabel,localTime,occurrenceFor} from '@/lib/workspace/time';
import {Dialog,ErrorPanel,LinkFields,Occurrence,mailLabels,useWorkspaceOptions,type Appointment,type Mail,type Options} from './shared';
import styles from './Operations.module.css';

function AppointmentEditor({record,day,zone,options,seedEnquiry,seedTask,close,saved}:{record:Appointment|null;day:string;zone:string;options:Options;seedEnquiry:string;seedTask:string;close:()=>void;saved:(record:Appointment)=>void}) {
  const role=useAuth(s=>s.user?.role);
  const [title,setTitle]=useState(record?.title||'');
  const [type,setType]=useState(record?.type||'meeting');
  const [timeZone,setTimeZone]=useState(record?.timeZone||zone);
  const [startLocal,setStart]=useState(record?localTime(record.start,record.timeZone):day+'T10:00');
  const [endLocal,setEnd]=useState(record?localTime(record.end,record.timeZone):day+'T11:00');
  const originalOccurrences=useMemo(()=>record?[occurrenceFor(record.start,record.timeZone),occurrenceFor(record.end,record.timeZone)]:['',''],[record]);
  const [startOccurrence,setStartOccurrence]=useState(originalOccurrences[0]);
  const [endOccurrence,setEndOccurrence]=useState(originalOccurrences[1]);
  const [vehicle,setVehicle]=useState(record?.vehicle||options.enquiries.find(item=>item._id===seedEnquiry)?.car||'');
  const [enquiry,setEnquiry]=useState(record?.enquiry||seedEnquiry);
  const [notes,setNotes]=useState(record?.notes||'');
  const [status,setStatus]=useState(record?.status||'scheduled');
  const [outcome,setOutcome]=useState(record?.outcome||'');
  const [requestKey]=useState(()=>crypto.randomUUID());
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[acceptConflicts,setAccept]=useState(false);
  const [conflicts,setConflicts]=useState<{_id:string;title:string;start:string;end:string}[]>([]);
  const [message,setMessage]=useState<Mail|null>(null);
  const closed=!!record&&record.status!=='scheduled';
  const dirty=!!record&&(title!==record.title||type!==record.type||timeZone!==record.timeZone||startLocal!==localTime(record.start,record.timeZone)||endLocal!==localTime(record.end,record.timeZone)||notes!==record.notes||status!==record.status||outcome!==record.outcome||startOccurrence!==originalOccurrences[0]||endOccurrence!==originalOccurrences[1]||enquiry!==(record.enquiry||'')||vehicle!==(record.vehicle||''));
  async function submit(event:FormEvent) {
    event.preventDefault();setBusy(true);setError('');
    try {
      const body={title,type,startLocal,endLocal,timeZone,startOccurrence,endOccurrence,vehicle:vehicle||null,enquiry:enquiry||null,notes,acceptConflicts,
        ...(record?{expectedVersion:record.__v,status,outcome}:{requestKey,task:seedTask||null})};
      const result=await api<{data:Appointment}>('/workspace/appointments'+(record?'/'+record._id:''),{method:record?'PUT':'POST',body});
      saved(result.data);
    } catch(err) {
      setError(err instanceof Error?err.message:'Appointment could not be saved.');
      if(err instanceof ApiError&&err.data&&typeof err.data==='object'&&'conflicts' in err.data) setConflicts((err.data as {conflicts:typeof conflicts}).conflicts);
    } finally {setBusy(false);}
  }
  async function send(retryFailed=false) {
    if(!record)return;
    setBusy(true);setError('');
    try {
      const result=await api<{data:Mail}>('/workspace/appointments/'+record._id+'/confirmation',{method:'POST',body:{expectedVersion:record.__v,retryFailed,...(retryFailed&&message?{expectedAttempts:message.attempts}:{})}});
      setMessage(result.data);
    } catch(err) {setError(err instanceof Error?err.message:'Email status could not be confirmed. Check email history before retrying.');}
    finally {setBusy(false);}
  }
  if(record?.buyerRequest)return <Dialog title='Buyer appointment' close={close}><p>{record.title}</p><p>Status: {record.status}</p><p>Manage confirmation, rescheduling and the buyer-visible outcome in the connected conversation.</p><Link href={'/dealer/enquiries?enquiry='+record.enquiry}>Open buyer conversation</Link></Dialog>;
  return <Dialog title={record?'Appointment details':'New appointment'} close={close}>
    <form className={styles.form} onSubmit={submit}>
      {seedTask&&!record&&<p className={styles.muted}>Saving will also link this appointment to the follow-up task you opened.</p>}
      <p className={styles.muted}>Times are entered in the named timezone. Invalid clock-change times are rejected; repeated times require an explicit occurrence.</p>
      {closed&&<p className={styles.badge} data-status={record.status}>{record.status} · read only</p>}
      <fieldset disabled={busy||closed}>
        <label>Appointment title<input autoFocus required maxLength={160} value={title} onChange={event=>setTitle(event.target.value)}/></label>
        <div className={styles.fields}><label>Type<select value={type} onChange={event=>setType(event.target.value as Appointment['type'])}><option value='meeting'>Meeting</option><option value='test-drive'>Test drive</option></select></label><label>IANA timezone<input required value={timeZone} placeholder='Europe/Berlin' onChange={event=>{setTimeZone(event.target.value);setStartOccurrence('');setEndOccurrence('');setConflicts([]);setAccept(false);}}/></label>
          <label>Start<input type='datetime-local' min='2000-01-01T00:00' max='2100-12-31T23:59' required value={startLocal} onChange={event=>{setStart(event.target.value);setStartOccurrence('');setAccept(false);setConflicts([]);}}/></label>
          <label>End<input type='datetime-local' min='2000-01-01T00:00' max='2100-12-31T23:59' required value={endLocal} onChange={event=>{setEnd(event.target.value);setEndOccurrence('');setAccept(false);setConflicts([]);}}/></label>
          <Occurrence name='Start' value={startOccurrence} onChange={value=>{setStartOccurrence(value);setAccept(false);setConflicts([]);}}/><Occurrence name='End' value={endOccurrence} onChange={value=>{setEndOccurrence(value);setAccept(false);setConflicts([]);}}/>
          <LinkFields disabled={!!record&&status!=='scheduled'} options={options} vehicle={vehicle} enquiry={enquiry} setVehicle={setVehicle} setEnquiry={setEnquiry}/>
        </div>
        <label>Private notes<textarea maxLength={2000} value={notes} onChange={event=>setNotes(event.target.value)}/></label>
        {record&&<div className={styles.fields}><label>Status<select value={status} onChange={event=>{setStatus(event.target.value as Appointment['status']);if(record&&event.target.value!=='scheduled'){setEnquiry(record.enquiry||'');setVehicle(record.vehicle||'');}}}><option value='scheduled'>Scheduled</option><option value='cancelled'>Cancelled</option><option value='completed'>Completed</option></select></label><label>Recorded outcome {status==='completed'?'(required)':'(optional)'}<textarea maxLength={2000} required={status==='completed'} value={outcome} onChange={event=>setOutcome(event.target.value)}/></label></div>}
        {conflicts.length>0&&<div className={styles.notice}><h3>Scheduling conflicts</h3><ul>{conflicts.map(item=><li key={item._id}>{item.title} · {clock(item.start,timeZone)}–{clock(item.end,timeZone)}</li>)}</ul><label className={styles.check}><input type='checkbox' checked={acceptConflicts} onChange={event=>setAccept(event.target.checked)}/>Allow this overlap after reviewing these appointments</label></div>}
      </fieldset>
      {record&&!closed&&<p className={styles.muted}>A recorded outcome is only included in email when you explicitly send the completed appointment’s outcome.</p>}
      {closed&&record.outcome&&<p className={styles.history}>Outcome: {record.outcome}</p>}
      {error&&<p role='alert' className={styles.error}>{error}</p>}
      {!closed&&<div className={styles.actions}><button className={styles.primary} disabled={busy} type='submit'>{busy?'Saving…':status==='cancelled'?'Save cancellation':status==='completed'?'Save outcome':'Save appointment'}</button><button type='button' disabled={busy} onClick={close}>Discard changes</button></div>}
      {record&&<section className={styles.notice}><h3>Customer confirmation</h3>{dirty&&<p role='status'>Save or discard your edits before sending the saved version.</p>}<p className={styles.muted}>Save changes before sending. Private notes are not included. Acceptance by the email provider does not prove delivery. One confirmation is allowed for each saved appointment version.</p>
        {role==='dealer'&&record.enquiry?<div className={styles.actions}><button type='button' disabled={busy||dirty} onClick={()=>void send()}>{busy?'Checking…':record.status==='cancelled'?'Send cancellation':record.status==='completed'?'Send recorded outcome':'Send confirmation'}</button><Link href={'/email?appointment='+record._id}>View email history</Link></div>:<p className={styles.muted}>Confirmation requires an authorized buyer enquiry and an approved dealer account. Admin calendars have no access to private dealer contacts.</p>}
        {!options.mailAvailable&&<p className={styles.muted}>Email provider is unavailable. Configure the local test sink for development; do not send to real customers.</p>}
        {message&&<div role='status'><p>{mailLabels[message.state]}</p>{message.failure&&<p>{message.failure}</p>}{message.state==='failed'&&<button type='button' disabled={busy||dirty} onClick={()=>void send(true)}>Retry failed email</button>}</div>}
      </section>}
      {record&&<Link href={'/tasks?appointment='+record._id+(record.enquiry?'&enquiry='+record.enquiry:'')}>Create linked follow-up task ↗</Link>}
    </form>
  </Dialog>;
}
export default function Calendar() {
  const user=useAuth(s=>s.user),params=useSearchParams(),router=useRouter(),client=useQueryClient();
  const [zone,setZone]=useState(()=>Intl.DateTimeFormat().resolvedOptions().timeZone||'Europe/Berlin');
  const [zoneInput,setZoneInput]=useState(zone),[zoneError,setZoneError]=useState(''),[dateError,setDateError]=useState('');
  const [anchor,setAnchor]=useState(()=>localTime(new Date().toISOString(),zone).slice(0,10)),[view,setView]=useState('month');
  const [selected,setSelected]=useState(anchor),[editing,setEditing]=useState<Appointment|null|undefined>(()=>params.get('enquiry')||params.get('task')?null:undefined),[dismissSeed,setDismissSeed]=useState(false),[notice,setNotice]=useState('');
  const days=useMemo(()=>calendarDays(anchor,view),[anchor,view]);
  const options=useWorkspaceOptions();
  const query=useQuery({queryKey:['workspace-appointments',user?.id,days[0],days.at(-1)],queryFn:({signal})=>api<{data:Appointment[];truncated:boolean}>(`/workspace/appointments?from=${addDays(days[0],-2)}T00:00Z&to=${addDays(days.at(-1)!,2)}T23:59Z`,{signal}),retry:false,gcTime:0});
  const requestedId=params.get('appointment');
  const seedId=requestedId&&/^[a-f0-9]{24}$/i.test(requestedId)?requestedId:null;
  const seed=useQuery({queryKey:['workspace-appointment',user?.id,seedId],queryFn:({signal})=>api<{data:Appointment}>('/workspace/appointments/'+seedId,{signal}),enabled:!!seedId&&!dismissSeed,retry:false,gcTime:0});
  const record=editing!==undefined?editing:!dismissSeed&&seed.data?seed.data.data:undefined;
  const appointmentsByDay=useMemo(()=>{
    const grouped=new Map<string,Appointment[]>();
    for(const item of query.data?.data||[]){
      const lastDay=localTime(new Date(new Date(item.end).getTime()-1).toISOString(),zone).slice(0,10);
      for(let day=localTime(item.start,zone).slice(0,10);day<=lastDay;day=addDays(day,1)) grouped.set(day,[...(grouped.get(day)||[]),item]);
    }
    return grouped;
  },[query.data,zone]);
  const onDay=(day:string)=>appointmentsByDay.get(day)||[];
  function navigate(amount:number) {
    setDateError('');
    if(view==='month') {const date=new Date(anchor.slice(0,7)+'-01T12:00Z');date.setUTCMonth(date.getUTCMonth()+amount);const day=date.toISOString().slice(0,10);if(day<'2000-01-01'||day>'2100-12-31'){setDateError('Calendar dates are supported from 2000 to 2100.');return;}setAnchor(day);setSelected(day);}
    else {const day=addDays(anchor,amount*(view==='week'?7:1));if(day<'2000-01-01'||day>'2100-12-31'){setDateError('Calendar dates are supported from 2000 to 2100.');return;}setAnchor(day);setSelected(day);}
  }
  function selectDayWithKey(event:React.KeyboardEvent,day:string){
    const delta:Record<string,number>={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7};
    if(!(event.key in delta))return;event.preventDefault();const next=addDays(day,delta[event.key]);if(next<'2000-01-01'||next>'2100-12-31')return;setSelected(next);if(!days.includes(next))setAnchor(next);requestAnimationFrame(()=>(document.getElementById('calendar-day-'+next)||document.getElementById('calendar-anchor'))?.focus());
  }
  function close(){setEditing(undefined);setDismissSeed(true);}
  function eventButton(item:Appointment) {return <button key={item._id} className={styles.event} onClick={()=>setEditing(item)}><strong>{item.title}</strong><span>{clock(item.start,zone)}–{clock(item.end,zone)}</span><small>{item.type==='test-drive'?'Test drive':'Meeting'} · {item.status}</small></button>;}
  function saved(item:Appointment) {close();if(params.get('enquiry')||params.get('task'))router.replace('/calendar',{scroll:false});const day=localTime(item.start,zone).slice(0,10);setAnchor(day);setSelected(day);setNotice('Appointment saved. Confirmation email is a separate action.');void client.invalidateQueries({queryKey:['workspace-appointments',user?.id]});void client.invalidateQueries({queryKey:['workspace-options',user?.id]});}
  return <main className={styles.page}>
    <p className={styles.eyebrow}>{user?.role==='admin'?'Administration':'Dealer workspace'} / Calendar</p><h1>Your calendar, considered.</h1><p className={styles.intro}>Private meetings and test drives. Only your appointments appear here; administrator access does not open dealer calendars.</p>
    <div className={styles.toolbar}><button onClick={()=>setEditing(null)} className={styles.primary}>New appointment</button>{['month','week','day'].map(mode=><button key={mode} aria-pressed={view===mode} onClick={()=>setView(mode)}>{mode[0].toUpperCase()+mode.slice(1)}</button>)}</div>
    <div className={styles.toolbar}><button aria-label='Previous calendar period' onClick={()=>navigate(-1)}>← Previous</button><button onClick={()=>{const today=localTime(new Date().toISOString(),zone).slice(0,10);setAnchor(today);setSelected(today);}}>Today</button><button aria-label='Next calendar period' onClick={()=>navigate(1)}>Next →</button><label>Go to date<input id='calendar-anchor' type='date' min='2000-01-01' max='2100-12-31' value={anchor} onChange={event=>{if(event.target.value){if(!/^\d{4}-\d{2}-\d{2}$/.test(event.target.value)||event.target.value<'2000-01-01'||event.target.value>'2100-12-31'){setDateError('Choose a date between 2000 and 2100.');return;}setDateError('');setAnchor(event.target.value);setSelected(event.target.value);}}}/></label></div>
    <form className={styles.toolbar} onSubmit={event=>{event.preventDefault();try{new Intl.DateTimeFormat('en-GB',{timeZone:zoneInput}).format();setZone(zoneInput);setZoneError('');}catch{setZoneError('Enter a valid IANA timezone.');}}}><label>Display timezone<input className={styles.zone} required value={zoneInput} onChange={event=>setZoneInput(event.target.value)}/></label><button>Apply timezone</button></form>
    {zoneError&&<p role='alert'>{zoneError}</p>}{dateError&&<p role='alert'>{dateError}</p>}<h2>{view==='month'?dayLabel(anchor,{month:'long',year:'numeric'}):view==='week'?dayLabel(days[0],{day:'numeric',month:'short'})+' – '+dayLabel(days[6],{day:'numeric',month:'short',year:'numeric'}):dayLabel(anchor)}</h2>
    {notice&&<p role='status'>{notice}</p>}
    {options.isError&&<ErrorPanel error={options.error} retry={()=>void options.refetch()}/>}
    {requestedId&&!seedId&&<p role='alert' className={styles.notice}>This appointment link is invalid. Choose an appointment from your calendar.</p>}
    {seed.isError&&!dismissSeed&&<ErrorPanel error={seed.error} retry={()=>void seed.refetch()}/>}
    {query.isPending?<p role='status'>Loading calendar…</p>:query.isError?<ErrorPanel error={query.error} retry={()=>void query.refetch()}/>:<>
      {query.data.truncated&&<p role='alert'>More than 500 appointments are in this range. Switch to week or day view to see a narrower range.</p>}
      {!query.data.data.length&&<p role='status'>No appointments in this period. Create a meeting or test drive to begin.</p>}
      {view==='month'?<><div className={styles.month}>{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day=><div className={styles.weekday} key={day}>{day}</div>)}{days.map(day=>{const events=onDay(day);return <button key={day} disabled={day<'2000-01-01'||day>'2100-12-31'} id={'calendar-day-'+day} tabIndex={day===selected?0:-1} onKeyDown={event=>selectDayWithKey(event,day)} className={styles.day} data-selected={day===selected} data-outside={day.slice(0,7)!==anchor.slice(0,7)} aria-pressed={day===selected} aria-label={dayLabel(day)+', '+events.length+' appointments'} onClick={()=>setSelected(day)}><strong>{Number(day.slice(-2))}</strong>{events.length>0&&<span>{events.length} records</span>}{events.slice(0,2).map(item=><span className={styles.eventTitle} key={item._id}>{item.title}</span>)}</button>;})}</div><section className={styles.agenda} aria-label='Selected day appointments'><h2>{dayLabel(selected)}</h2>{onDay(selected).length?onDay(selected).map(eventButton):<p className={styles.muted}>No appointments on this day.</p>}<button onClick={()=>setEditing(null)}>Add appointment on selected day</button></section></>:view==='week'?<div className={styles.week}>{days.map(day=><section key={day}><h2>{dayLabel(day,{weekday:'short',day:'numeric',month:'short'})}</h2>{onDay(day).length?onDay(day).map(eventButton):<p className={styles.muted}>No appointments</p>}</section>)}</div>:<section aria-label='Day appointments'>{onDay(anchor).length?onDay(anchor).map(eventButton):<p className={styles.muted}>No appointments on this day.</p>}</section>}
    </>}
    {record!==undefined&&(options.isPending?<p role='status'>Loading editor links…</p>:options.data&&<AppointmentEditor key={record?record._id+'-'+record.__v:'new'} record={record} day={view==='month'?selected:anchor} zone={zone} options={options.data} seedEnquiry={params.get('enquiry')||''} seedTask={params.get('task')||''} close={close} saved={saved}/>)}
  </main>;
}
