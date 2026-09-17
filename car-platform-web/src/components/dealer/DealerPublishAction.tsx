'use client';
import {useRef,useState} from 'react';
import {useRouter} from 'next/navigation';
import shared from './DealerWorkspace.module.css';
import styles from './DealerListingReview.module.css';
const api=process.env.NEXT_PUBLIC_API_BASE_URL||'http://localhost:5050/api';
export default function DealerPublishAction({carId,isPublished,ready}:{carId:string;isPublished:boolean;ready:boolean}){
 const router=useRouter();
 const [confirming,setConfirming]=useState(false);
 const [confirmed,setConfirmed]=useState(false);
 const [busy,setBusy]=useState(false);
 const [done,setDone]=useState(false);
 const [error,setError]=useState('');
 const lock=useRef(false);
 const trigger=useRef<HTMLButtonElement>(null);
 async function save(){
  if(lock.current||(!isPublished&&(!ready||!confirmed)))return;
  lock.current=true;setBusy(true);setError('');
  try{
   const res=await fetch(`${api}/dealer/cars/${carId}/${isPublished?'unpublish':'publish'}`,{method:'PUT',credentials:'include'});
   const data=await res.json();
   if(!res.ok)throw new Error(data.message||'Unable to update the listing. Please try again.');
   setDone(true);setConfirming(false);router.refresh();
  }catch(err){setError(err instanceof Error?err.message:'Unable to update the listing. Please try again.');lock.current=false;}
  finally{setBusy(false);}
 }
 if(done)return <p role="status" className={styles.result}>{isPublished?'Listing unpublished. It is now a private draft.':'Listing published. Buyers can now explore it.'}</p>;
 return <div className={styles.publish}>
  {!confirming?<button ref={trigger} className={isPublished?shared.secondary:shared.primary} disabled={!isPublished&&!ready} onClick={()=>{setConfirming(true);setConfirmed(false);setError('');}}>{isPublished?'Unpublish listing':'Publish listing'}</button>:<div className={styles.confirm} role="group" aria-label={isPublished?'Confirm unpublishing':'Confirm publication'}>
   <h3>{isPublished?'Return to a private draft?':'Ready to go live?'}</h3><p>{isPublished?'This removes the vehicle from public browsing. Your details and photos will stay in inventory.':'Publishing makes this vehicle visible to everyone browsing Carvia.'}</p>
   {!isPublished&&<label><input autoFocus type="checkbox" checked={confirmed} disabled={busy} onChange={e=>setConfirmed(e.target.checked)}/><span>I have checked the vehicle details, asking price and photos, and I’m authorised to publish this listing.</span></label>}
   <button autoFocus={isPublished} className={shared.primary} disabled={busy||(!isPublished&&!confirmed)} onClick={()=>void save()}>{busy?'Saving…':isPublished?'Confirm unpublish':'Confirm & publish'}</button>
   <button className={shared.secondary} disabled={busy} onClick={()=>{setConfirming(false);setError('');requestAnimationFrame(()=>trigger.current?.focus());}}>Keep reviewing</button>
  </div>}
  {error&&<p role="alert" className={shared.error}>{error}</p>}
 </div>;
}
