'use client';
import { useState } from 'react';
import styles from './VehicleDetail.module.css';
export default function SellerEnquiry({carId,title,email,phone}:{carId:string;title:string;email?:string;phone?:string}) {
  const [message,setMessage]=useState(`Hello, I’m interested in ${title}. Is this vehicle still available? I’d like to learn more and arrange a viewing.`);
  const [draft,setDraft]=useState('');
  const safeEmail=email && /^[^\s@<>,;:?&#]+@[^\s@<>,;:?&#]+\.[^\s@<>,;:?&#]+$/.test(email)?email:null;
  const telephone=phone?.replace(/[\s().-]/g,'');
  const safePhone=telephone && /^\+?[0-9]{6,15}$/.test(telephone)?telephone:null;
  return <section id='vehicle-enquiry' className={styles.enquiry} aria-labelledby='enquiry-title'><div><p className={styles.eyebrow}>Your next conversation</p><h2 id='enquiry-title'>Make the connection.</h2><p>Contact the seller about this vehicle. Email enquiries open in your own email app for you to review and send.</p>{safePhone && <a className={styles.phone} href={`tel:${safePhone}`}>Call {phone} <span aria-hidden='true'>↗</span></a>}{!safeEmail && <p className={styles.notice}>{safePhone?'Email contact is not available for this listing. You can call the seller instead.':'Contact details are not available for this listing yet.'}</p>}</div>
    {safeEmail && <form className={styles.enquiryForm} onSubmit={event=>{event.preventDefault();const url=new URL(`/cars/${encodeURIComponent(carId)}`,window.location.origin).href;setDraft(`mailto:${encodeURIComponent(safeEmail)}?subject=${encodeURIComponent(`Enquiry: ${title}`)}&body=${encodeURIComponent(`${message.trim()}\n\nVehicle: ${title}\nListing: ${url}`)}`);}}>
      <p className={styles.recipient}>To: {safeEmail}</p><label htmlFor='enquiry-message'>Your message<textarea id='enquiry-message' required minLength={20} maxLength={1500} rows={6} value={message} onChange={event=>{setMessage(event.target.value);setDraft('');}} /></label>
      <button className={styles.primary} type='submit' disabled={message.trim().length<20}>Prepare email <span aria-hidden='true'>↗</span></button>
      {draft && <div className={styles.draft} role='status'><p>Your draft is ready. Nothing has been sent.</p><a className={styles.primary} href={draft}>Open email app <span aria-hidden='true'>↗</span></a><p>Review and send it there. If no email app opens, contact the seller at {safeEmail}.</p></div>}
    </form>}
  </section>;
}
