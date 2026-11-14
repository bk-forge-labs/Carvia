'use client';
import {useRef,useState} from 'react';
import Link from 'next/link';
import {api,ApiError} from '@/lib/api/browser';
import {useAuth} from '@/lib/store/auth';
import styles from './VehicleDetail.module.css';
export default function SellerEnquiry({carId,title,phone}:{carId:string;title:string;email?:string;phone?:string}) {
 const user=useAuth(s=>s.user), hydrated=useAuth(s=>s.hasHydrated);
 const [message,setMessage]=useState(`Hello, I’m interested in ${title}. Is this vehicle still available? I’d like to learn more and arrange a viewing.`);
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[sent,setSent]=useState<{id:string;alreadyExists:boolean}|null>(null);
 const lock=useRef(false);
 const telephone=phone?.replace(/[\s().-]/g,'');
 const safePhone=telephone&&/^\+?[0-9]{6,15}$/.test(telephone)?telephone:null;
 async function send(event:React.FormEvent){event.preventDefault();if(lock.current)return;lock.current=true;setBusy(true);setError('');try{setSent(await api('/enquiries',{method:'POST',body:{carId,message}}));}catch(e){setError(e instanceof ApiError?e.message:'Your enquiry could not be confirmed. Try again; it will not create a duplicate.');}finally{lock.current=false;setBusy(false);}}
 return <section id='vehicle-enquiry' className={styles.enquiry} aria-labelledby='enquiry-title'><div><p className={styles.eyebrow}>Your next conversation</p><h2 id='enquiry-title'>Make the connection.</h2><p>Ask about this vehicle. Your enquiry goes directly to the seller’s Veltrenne inbox.</p>{safePhone&&<a className={styles.phone} href={`tel:${safePhone}`}>Call {phone} ↗</a>}</div>
 <div className={styles.enquiryForm}>{!hydrated?<p role='status'>Checking your account…</p>:!user?<><p>Sign in as a buyer to send an enquiry and keep it in one place.</p><Link className={styles.primary} href={`/login?next=${encodeURIComponent(`/cars/${carId}#vehicle-enquiry`)}`}>Sign in to enquire →</Link></>:user.role!=='buyer'?<p>Enquiries are available to buyer accounts. You can still contact the seller by phone.</p>:sent?<div role='status'><h3>{sent.alreadyExists?'Your enquiry is already saved.':'Your enquiry has been sent.'}</h3><p>{sent.alreadyExists?'Your original message is in your enquiries.':'The seller can now see your message and contact you at your account email.'}</p><Link className={styles.primary} href='/buyer/enquiries'>View my enquiries →</Link></div>:<form onSubmit={send}><p className={styles.recipient}>The seller will receive your name and email: {user.email}</p><label htmlFor='enquiry-message'>Your message<textarea id='enquiry-message' required minLength={20} maxLength={1500} rows={6} value={message} disabled={busy} onChange={e=>setMessage(e.target.value)}/></label><p>One enquiry per vehicle. The seller will contact you by email; replies are not handled in Veltrenne yet.</p>{error&&<p role='alert'>{error}</p>}<button className={styles.primary} disabled={busy||message.trim().length<20}>{busy?'Sending…':'Send enquiry →'}</button></form>}</div></section>;
}
