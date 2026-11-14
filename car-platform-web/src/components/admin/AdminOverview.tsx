'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {api} from '@/lib/api/browser';
import styles from './DealerDirectory.module.css';
type Stats={dealers:{pendingProfiles:number};cars:{held:number;published:number;total:number}};
export default function AdminOverview(){
 const [data,setData]=useState<Stats|null>(null),[error,setError]=useState(false),[attempt,setAttempt]=useState(0);
 useEffect(()=>{let active=true;const controller=new AbortController();api<{data:Stats}>('/admin/stats',{signal:controller.signal}).then(r=>{if(active){setData(r.data);setError(false);}}).catch(()=>{if(active)setError(true);});return()=>{active=false;controller.abort();};},[attempt]);
 return <main className={styles.page}><div className={styles.inner}><header className={styles.heading}><p className={styles.eyebrow}>Veltrenne administration</p><h1>Review with confidence.</h1><p>A clear view of what needs your attention.</p></header>
 {error?<div className={styles.panel} role='alert'>We couldn’t load your review queues. <button onClick={()=>setAttempt(n=>n+1)}>Try again</button></div>:!data?<p role='status'>Loading review queues…</p>:<div className={styles.list}>
 <Link className={styles.row} href='/admin/dealers?status=pending'><div><p>Dealer applications</p><h2>{data.dealers.pendingProfiles} awaiting review</h2><p>Review business details before granting publication access.</p></div><span aria-hidden='true'>↗</span></Link>
 <Link className={styles.row} href='/admin/cars'><div><p>Inventory checks</p><h2>{data.cars.held} publication holds</h2><p>Resolve vehicle identity, photograph and seller checks.</p></div><span aria-hidden='true'>↗</span></Link>
 <Link className={styles.row} href='/admin/dealers'><div><h2>All dealerships</h2><p>Find a business and inspect its review history.</p></div><span aria-hidden='true'>↗</span></Link>
 </div>}</div></main>;
}
