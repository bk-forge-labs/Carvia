'use client';
import {useState} from 'react';
import {useSearchParams} from 'next/navigation';
import Link from 'next/link';
import {useQuery} from '@tanstack/react-query';
import {api} from '@/lib/api/browser';
import {useAuth} from '@/lib/store/auth';
import {ErrorPanel,mailLabels,type Mail} from './shared';
import styles from './Operations.module.css';
export default function EmailHistory() {
  const user=useAuth(s=>s.user),params=useSearchParams();
  const [page,setPage]=useState(1),[busy,setBusy]=useState(''),[error,setError]=useState('');
  const appointment=params.get('appointment')||'';
  const query=useQuery({queryKey:['workspace-messages',user?.id,appointment,page],queryFn:({signal})=>api<{data:Mail[];page:number;pages:number;total:number;mailAvailable:boolean}>(`/workspace/messages?page=${page}${appointment?'&appointment='+encodeURIComponent(appointment):''}`,{signal}),retry:false,gcTime:0,refetchInterval:10000});
  async function retry(message:Mail) {
    setBusy(message._id);setError('');
    try {
      await api('/workspace/appointments/'+message.appointment+'/confirmation',{method:'POST',body:{expectedVersion:message.appointmentVersion,...(message.state==='failed'?{retryFailed:true,expectedAttempts:message.attempts}:{})}});
      await query.refetch();
    } catch(err) {setError(err instanceof Error?err.message:'Email status could not be checked.');}
    finally {setBusy('');}
  }
  return <main className={styles.page}>
    <p className={styles.eyebrow}>{user?.role==='admin'?'Administration':'Dealer workspace'} / Email history</p><h1>Every confirmation, accounted for.</h1><p className={styles.intro}>Confirmation email created from your authorized appointments. Queued, sending, accepted, failed and uncertain states are recorded separately. Delivery is not tracked: provider acceptance is not proof of receipt.</p>
    <div className={styles.toolbar}><Link href='/calendar'>Open calendar ↗</Link>{appointment&&<Link href='/email'>All email history ↗</Link>}<button onClick={()=>void query.refetch()}>Refresh status</button></div>
    {error&&<p role='alert' className={styles.error}>{error}</p>}
    {query.isPending?<p role='status'>Loading email history…</p>:query.isError?<ErrorPanel error={query.error} retry={()=>void query.refetch()}/>:<>
      {!query.data.mailAvailable&&<p className={styles.notice}>Email provider is unavailable. Development verification uses a local test sink. Production activation requires provider configuration.</p>}
      {!query.data.data.length?<section className={styles.notice}><h2>No confirmation messages here yet.</h2><p>Inspect a saved appointment to send its confirmation to the customer linked through its enquiry.</p>{page>1&&<button onClick={()=>setPage(1)}>Back to first page</button>}</section>:<div className={styles.list}>{query.data.data.map(message=><article key={message._id} className={styles.card}>
        <span className={styles.badge} data-status={message.state}>{mailLabels[message.state]}</span><h2>{message.subject}</h2><p>To {message.recipient}</p><p>Saved appointment version {message.appointmentVersion+1} · {message.attempts} {message.attempts===1?'attempt':'attempts'}</p>
        {message.messageId&&<p className={styles.muted}>Message-ID: {message.messageId}</p>}{message.failure&&<p>{message.failure}</p>}{message.state==='sending'&&<p>Check status again. If this remains unchanged, investigate the provider before attempting another send.</p>}
        <details><summary>Inspect recorded message</summary><div className={styles.history}>{message.text}</div></details>
        <div className={styles.actions}><Link href={'/calendar?appointment='+message.appointment}>Open appointment ↗</Link>{['queued','failed'].includes(message.state)&&<button disabled={!!busy} onClick={()=>void retry(message)}>{busy===message._id?'Checking…':message.state==='queued'?'Send queued confirmation':'Retry failed email'}</button>}</div>
      </article>)}</div>}
      {query.data.pages>1&&<nav className={styles.pager} aria-label='Email history pages'><button disabled={page<=1} onClick={()=>setPage(value=>value-1)}>Previous</button><span>Page {page} of {query.data.pages}</span><button disabled={page>=query.data.pages} onClick={()=>setPage(value=>value+1)}>Next</button></nav>}
    </>}
  </main>;
}
