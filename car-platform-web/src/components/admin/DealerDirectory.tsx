'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api/browser';
import ReviewAction from './ReviewAction';
import styles from './DealerDirectory.module.css';
type Dealer = { updatedAt: string; reviewHistory?: { _id: string; action: string; note: string; at: string; by?: {name?: string} | null }[]; _id: string; companyName: string; phone?: string; address?: string; status: string; rejectionReason?: string; user?: { name?: string; email?: string } | null; moderation?: { lastAction?: string; at?: string; by?: { name?: string } | null } };
type Result = { success: boolean; data: Dealer | Dealer[]; pagination?: { page: number; totalPages: number; totalDealers: number } };
const statuses = ['pending', 'approved', 'rejected', 'suspended'];
export default function DealerDirectory({ id }: { id?: string }) {
  const [notice,setNotice] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [attempt, setAttempt] = useState(0);
  const path = id ? `/admin/dealers/${encodeURIComponent(id)}` : `/admin/dealers?page=${page}&status=${status}`;
  const [response, setResponse] = useState<{ key: string; result?: Result; error?: string }>({ key: '' });
  const key = `${path}:${attempt}`;
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    api<Result>(path, { signal: controller.signal }).then(result => {
      if (!result.success || !result.data) throw new Error('Invalid response');
      if (active) setResponse({ key, result });
    }).catch(error => {
      if (active) setResponse({ key, error: error instanceof ApiError && error.status === 404 ? 'This dealer profile is no longer available.' : error instanceof ApiError && [401,403].includes(error.status) ? 'An administrator account is required to view these records.' : 'We couldn’t load the dealer records. Please try again.' });
    }).finally(() => clearTimeout(timeout));
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [path, key]);
  const current = response.key === key ? response : null;
  const result = current?.result;
  const dealer = result && !Array.isArray(result.data) ? result.data : null;
  const list = result && Array.isArray(result.data) ? result.data : [];
  return <main className={styles.page}><div className={styles.inner}>
    <nav aria-label='Breadcrumb' className={styles.breadcrumb}><Link href='/admin'>Administration</Link><span aria-hidden='true'>/</span>{id ? <Link href='/admin/dealers'>Dealers</Link> : <span>Dealers</span>}</nav>
    <header className={styles.heading}><p className={styles.eyebrow}>Carvia administration</p><h1>{id ? dealer?.companyName || 'Dealer profile' : 'Dealer directory'}</h1><p>{id ? 'Business details and the latest review status.' : 'Find a dealership and review its current account status.'}</p></header>
    {notice && <p role='status' className={styles.confirmation}>{notice}</p>}
    {!id && <div className={styles.toolbar}><label htmlFor='dealer-status'>Account status</label><select id='dealer-status' value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}><option value=''>All statuses</option>{statuses.map(value => <option key={value} value={value}>{value[0].toUpperCase()+value.slice(1)}</option>)}</select>{result?.pagination && <span>{result.pagination.totalDealers} {result.pagination.totalDealers === 1 ? 'dealer' : 'dealers'}</span>}</div>}
    {!current ? <div className={styles.panel} role='status' aria-busy='true'>Loading dealer records…</div> : current.error ? <div className={styles.panel} role='alert'><p>{current.error}</p><button type='button' onClick={() => setAttempt(value => value+1)}>Try again</button></div> : dealer ? <>
      <section className={styles.panel} aria-labelledby='business-details'><div className={styles.panelHeading}><h2 id='business-details'>Business details</h2><span className={styles.badge} data-status={dealer.status}>{dealer.status}</span></div><dl className={styles.details}>{[['Contact',dealer.user?.name],['Email',dealer.user?.email],['Phone',dealer.phone],['Address',dealer.address]].map(([label,value]) => <div key={label}><dt>{label}</dt><dd>{value || 'Not provided'}</dd></div>)}</dl></section>
      <section className={styles.panel} aria-labelledby='review-status'><h2 id='review-status'>Review record</h2>{dealer.moderation?.lastAction ? <dl className={styles.details}><div><dt>Latest action</dt><dd>{dealer.moderation.lastAction}</dd></div><div><dt>Reviewed by</dt><dd>{dealer.moderation.by?.name || 'Not recorded'}</dd></div><div><dt>Date</dt><dd>{dealer.moderation.at ? new Date(dealer.moderation.at).toLocaleDateString('en-GB',{timeZone:'UTC',day:'numeric',month:'long',year:'numeric'}) : 'Not recorded'}</dd></div></dl> : <p>No review action has been recorded.</p>}{dealer.rejectionReason && <p className={styles.reason}>{dealer.rejectionReason}</p>}</section>
      <ReviewAction key={dealer.updatedAt} updatedAt={dealer.updatedAt} onDone={message=>{setNotice(message);setAttempt(value=>value+1);}} actions={dealer.status==='pending' ? [{label:'Approve dealer',path:`/admin/dealers/approve/${dealer._id}`,consequence:'This dealer will be able to publish eligible vehicles. Existing inventory holds remain in place.'},{label:'Reject application',path:`/admin/dealers/reject/${dealer._id}`,consequence:'This application will be rejected. Record a clear reason for the dealer.'}] : dealer.status==='approved' ? [{label:'Suspend dealer',path:`/admin/dealers/suspend/${dealer._id}`,consequence:'This dealer will lose publication access. All currently published vehicles belonging to this dealer will be unpublished.'}] : [{label:'Return to review',path:`/admin/dealers/reactivate/${dealer._id}`,consequence:'This application returns to pending review. Publication access and listings will not be restored automatically.'}]} />
      {!!dealer.reviewHistory?.length && <section className={styles.panel}><h2>Decision history</h2><ol className={styles.history}>{[...dealer.reviewHistory].reverse().map(item=><li key={item._id}><strong>{item.action}</strong><p>{item.note}</p><small>{item.by?.name || 'Administrator'} · {new Date(item.at).toLocaleString('en-GB')}</small></li>)}</ol></section>}
      <Link className={styles.back} href='/admin/dealers'>← Back to dealers</Link>
    </> : list.length ? <><div className={styles.list}>{list.map(item => <Link href={`/admin/dealers/${encodeURIComponent(item._id)}`} key={item._id} className={styles.row}><div><h2>{item.companyName}</h2><p>{item.user?.name || 'Contact not provided'}</p></div><span className={styles.badge} data-status={item.status}>{item.status}</span><span aria-hidden='true'>↗</span></Link>)}</div>{result?.pagination && result.pagination.totalPages > 1 && <nav className={styles.pagination} aria-label='Dealer pages'><button disabled={page <= 1} onClick={() => setPage(value => value-1)}>← Previous</button><span>Page {page} of {result.pagination.totalPages}</span><button disabled={page >= result.pagination.totalPages} onClick={() => setPage(value => value+1)}>Next →</button></nav>}</> : <div className={styles.panel}><h2>No dealers found</h2><p>{status ? 'No dealer profiles have this status.' : 'Dealer profiles will appear here after registration.'}</p>{status && <button onClick={() => { setStatus(''); setPage(1); }}>View all statuses</button>}{page > 1 && <button onClick={() => setPage(1)}>Back to first page</button>}</div>}
  </div></main>;
}
