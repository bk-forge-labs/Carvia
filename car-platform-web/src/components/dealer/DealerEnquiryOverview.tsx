'use client';
import DealerAppointmentActions from './DealerAppointmentActions';
import Link from 'next/link';
import {useQuery} from '@tanstack/react-query';
import {api} from '@/lib/api/browser';
import {useAuth} from '@/lib/store/auth';
import styles from './DealerCommandCenter.module.css';

type Enquiry = {id:string;buyerName?:string;vehicleTitle:string;status:'new'|'contacted'|'closed'};
const labels = {new:'New',contacted:'Contacted',closed:'Closed'};
export default function DealerEnquiryOverview(){
  const user=useAuth(s=>s.user), hydrated=useAuth(s=>s.hasHydrated);
  const enabled=hydrated&&user?.role==='dealer';
  const summary=useQuery({queryKey:['enquiry-count',user?.id],queryFn:({signal})=>api<{newCount:number;unansweredCount:number}>('/enquiries/summary',{signal}),enabled,staleTime:15000,refetchInterval:30000,refetchOnWindowFocus:'always',gcTime:0,retry:false});
  const inbox=useQuery({queryKey:['enquiries',user?.id,'dealer',1],queryFn:({signal})=>api<{data:Enquiry[];total:number;page:number;pages:number}>('/enquiries?page=1',{signal}),enabled,refetchInterval:30000,gcTime:0,retry:false});
  return <><DealerAppointmentActions/><section className={styles.panel} aria-labelledby='buyer-interest'>
    <div className={styles.panelHeading}><div><p className={styles.eyebrow}>Buyer interest</p><h2 id='buyer-interest'>Conversations start here.</h2></div><Link className={styles.textLink} href='/dealer/enquiries'>Open inbox <span aria-hidden='true'>↗</span></Link></div>
    <div className={styles.enquirySummary}>
      {!enabled?<p role='status'>Checking your dealer session…</p>:summary.isError?<div role='status'><p>Enquiry count is unavailable.</p><button className={styles.retry} onClick={()=>void summary.refetch()}>Retry count</button></div>:summary.isPending?<p role='status'>Checking new enquiries…</p>:<><strong className={styles.enquiryNumber}>{summary.data.unansweredCount.toLocaleString('en-GB')}</strong><div><h3>{summary.data.unansweredCount===1?'Enquiry awaiting a dealer reply':'Enquiries awaiting a dealer reply'}</h3><p>{summary.data.unansweredCount?'Open your inbox to contact buyers and update their status.':'No new enquiries awaiting a dealer reply.'}</p></div></>}
    </div>
    <div className={styles.listHeading}><h3>Latest enquiries</h3><span>Most recent first</span></div>
    {!enabled?null:inbox.isError?<div className={styles.empty} role='status'><p>We couldn’t load your latest enquiries.</p><button className={styles.retry} onClick={()=>void inbox.refetch()}>Try again</button></div>:inbox.isPending?<p className={styles.loading} role='status'>Loading conversations…</p>:inbox.data.data.length?<ul className={styles.enquiryList}>{inbox.data.data.slice(0,3).map(item=><li key={item.id}><Link href='/dealer/enquiries'><span className={styles.avatar} aria-hidden='true'>{item.buyerName?.trim().slice(0,1).toUpperCase()||'B'}</span><span className={styles.buyer}><strong>{item.buyerName||'Account unavailable'}</strong><span>{item.vehicleTitle}</span></span><span className={styles.status} data-status={item.status}>{labels[item.status]}</span><span aria-hidden='true'>↗</span></Link></li>)}</ul>:<div className={styles.empty}><h3>Room for your next conversation.</h3><p>When a buyer enquires about a vehicle, their name and vehicle will appear here.</p></div>}
    <p className={styles.panelNote}>Reply to answer the buyer; close a conversation when no further action is needed.</p>
  </section></>;
}
