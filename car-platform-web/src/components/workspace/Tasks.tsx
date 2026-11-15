'use client';
import {useState,type FormEvent} from 'react';
import {useSearchParams,useRouter} from 'next/navigation';
import Link from 'next/link';
import {useQuery,useQueryClient} from '@tanstack/react-query';
import {api} from '@/lib/api/browser';
import {useAuth} from '@/lib/store/auth';
import {localTime,occurrenceFor} from '@/lib/workspace/time';
import {Dialog,ErrorPanel,LinkFields,Occurrence,useWorkspaceOptions,type Task,type Options} from './shared';
import styles from './Operations.module.css';

function TaskEditor({record,options,seedEnquiry,seedAppointment,saved,close}:{record:Task|null;options:Options;seedEnquiry:string;seedAppointment:string;saved:()=>void;close:()=>void}) {
  const [title,setTitle]=useState(record?.title||'');
  const [zone,setZone]=useState(record?.timeZone||Intl.DateTimeFormat().resolvedOptions().timeZone||'Europe/Berlin');
  const [due,setDue]=useState(record?localTime(record.dueAt,zone):localTime(new Date().toISOString(),zone));
  const [occurrence,setOccurrence]=useState(()=>record?occurrenceFor(record.dueAt,zone):'');
  const [status,setStatus]=useState(record?.status||'open'),[notes,setNotes]=useState(record?.notes||'');
  const [enquiry,setEnquiry]=useState(record?.enquiry||seedEnquiry),[vehicle,setVehicle]=useState(record?.vehicle||options.enquiries.find(item=>item._id===seedEnquiry)?.car||''),[appointment,setAppointment]=useState(record?.appointment||seedAppointment);
  const [requestKey]=useState(()=>crypto.randomUUID());
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  async function submit(event:FormEvent) {
    event.preventDefault();setBusy(true);setError('');
    try {
      await api('/workspace/tasks'+(record?'/'+record._id:''),{method:record?'PUT':'POST',body:{
        title,dueLocal:due,timeZone:zone,dueOccurrence:occurrence,status,notes,enquiry:enquiry||null,vehicle:vehicle||null,appointment:appointment||null,
        ...(record?{expectedVersion:record.__v}:{requestKey}),
      }});
      saved();
    } catch(err) {setError(err instanceof Error?err.message:'Task could not be saved.');}
    finally {setBusy(false);}
  }
  return <Dialog title={record?'Follow-up task':'New follow-up task'} close={close}><form onSubmit={submit} className={styles.form}>
    <p className={styles.muted}>Tasks belong to you. Links are checked against your authorized records; no team assignment or delegation is implied.</p>
    <fieldset disabled={busy}><label>Task title<input autoFocus required maxLength={160} value={title} onChange={event=>setTitle(event.target.value)}/></label>
      <div className={styles.fields}><label>Due date and time<input type='datetime-local' min='2000-01-01T00:00' max='2100-12-31T23:59' required value={due} onChange={event=>{setDue(event.target.value);setOccurrence('');}}/></label><label>IANA timezone<input required value={zone} onChange={event=>{setZone(event.target.value);setOccurrence('');}}/></label>
        <Occurrence name='Due time' value={occurrence} onChange={setOccurrence}/>
        <label>Status<select value={status} onChange={event=>setStatus(event.target.value as Task['status'])}><option value='open'>Open</option><option value='in-progress'>In progress</option><option value='done'>Done</option><option value='cancelled'>Cancelled</option></select></label>
        <LinkFields options={options} vehicle={vehicle} enquiry={enquiry} appointment={appointment} setVehicle={setVehicle} setEnquiry={setEnquiry} setAppointment={setAppointment}/>
      </div><label>Private follow-up notes<textarea maxLength={2000} value={notes} onChange={event=>setNotes(event.target.value)}/></label>
    </fieldset>
    {error&&<p role='alert' className={styles.error}>{error}</p>}
    <div className={styles.actions}><button className={styles.primary} disabled={busy}>{busy?'Saving…':'Save task'}</button><button type='button' disabled={busy} onClick={close}>Discard changes</button></div>
  </form></Dialog>;
}
export default function Tasks() {
  const user=useAuth(s=>s.user),params=useSearchParams(),router=useRouter(),client=useQueryClient(),options=useWorkspaceOptions();
  const [status,setStatus]=useState(''),[page,setPage]=useState(1),[notice,setNotice]=useState('');
  const [editing,setEditing]=useState<Task|null|undefined>(()=>params.get('enquiry')||params.get('appointment')?null:undefined);
  const query=useQuery({queryKey:['workspace-tasks',user?.id,status,page],queryFn:({signal})=>api<{data:Task[];page:number;pages:number;total:number}>(`/workspace/tasks?page=${page}&status=${status}`,{signal}),retry:false,gcTime:0});
  function saved(){setEditing(undefined);if(params.get('enquiry')||params.get('appointment'))router.replace('/tasks',{scroll:false});setNotice('Follow-up task saved.');void client.invalidateQueries({queryKey:['workspace-tasks',user?.id]});}
  return <main className={styles.page}>
    <p className={styles.eyebrow}>{user?.role==='admin'?'Administration':'Dealer workspace'} / Tasks</p><h1>A clear next step.</h1><p className={styles.intro}>Your private follow-ups, linked to the conversations and appointments they support.</p>
    <div className={styles.toolbar}><button className={styles.primary} onClick={()=>setEditing(null)}>New task</button><label>Task status<select value={status} onChange={event=>{setStatus(event.target.value);setPage(1);}}><option value=''>All statuses</option><option value='open'>Open</option><option value='in-progress'>In progress</option><option value='done'>Done</option><option value='cancelled'>Cancelled</option></select></label></div>
    {notice&&<p role='status'>{notice}</p>}
    {options.isError&&<ErrorPanel error={options.error} retry={()=>void options.refetch()}/>}
    {query.isPending?<p role='status'>Loading follow-up tasks…</p>:query.isError?<ErrorPanel error={query.error} retry={()=>void query.refetch()}/>:<>
      <p role='status'>{query.data.total} {query.data.total===1?'task':'tasks'}</p>
      {!query.data.data.length?<section className={styles.notice}><h2>{status?'No tasks with this status.':'Your next follow-up belongs here.'}</h2><p>Create a task from an enquiry, or start one here.</p>{status&&<button onClick={()=>setStatus('')}>Show all statuses</button>}{page>1&&<button onClick={()=>setPage(1)}>Back to first page</button>}</section>:<div className={styles.list}>{query.data.data.map(task=><article className={styles.card} key={task._id}><span className={styles.badge} data-status={task.status}>{task.status.replace('-',' ')}</span><h2>{task.title}</h2><p>Due <time dateTime={task.dueAt}>{new Date(task.dueAt).toLocaleString('en-GB',{dateStyle:'medium',timeStyle:'short',timeZone:task.timeZone})}</time> · {task.timeZone}</p>{task.notes&&<p>{task.notes}</p>}
        <div className={styles.actions}><button onClick={()=>setEditing(task)}>Inspect / update task</button>{task.appointment?<Link href={'/calendar?appointment='+task.appointment}>Open appointment ↗</Link>:task.enquiry?<Link href={'/calendar?enquiry='+task.enquiry+'&task='+task._id}>Schedule viewing / test drive ↗</Link>:null}{task.enquiry&&<Link href='/dealer/enquiries'>Enquiry inbox ↗</Link>}</div>
      </article>)}</div>}
      {query.data.pages>1&&<nav className={styles.pager} aria-label='Task pages'><button disabled={page<=1} onClick={()=>setPage(value=>value-1)}>Previous</button><span>Page {page} of {query.data.pages}</span><button disabled={page>=query.data.pages} onClick={()=>setPage(value=>value+1)}>Next</button></nav>}
    </>}
    {editing!==undefined&&(options.isPending?<p role='status'>Loading task links…</p>:options.data&&<TaskEditor key={editing?editing._id+'-'+editing.__v:'new'} record={editing} options={options.data} seedEnquiry={params.get('enquiry')||''} seedAppointment={params.get('appointment')||''} saved={saved} close={()=>setEditing(undefined)}/>)}
  </main>;
}
