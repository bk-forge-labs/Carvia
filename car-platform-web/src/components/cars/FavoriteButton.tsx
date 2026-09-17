'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api,ApiError } from '@/lib/api/browser';
import { setFavoriteBrowser } from '@/lib/api/favorites';
import Link from 'next/link';
import { signInHref } from '@/lib/auth/returnTo';
import styles from './VehicleDetail.module.css';
export default function FavoriteButton({carId}:{carId:string}) {
  const router=useRouter();const [saved,setSaved]=useState(false);const [ready,setReady]=useState(false);const [attempt,setAttempt]=useState(0);const [error,setError]=useState('');const [busy,setBusy]=useState(false);const lock=useRef(false);
  useEffect(()=>{let active=true;const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),7000);api<{success:boolean;data:{_id:string}[]}>('/favorites/me',{signal:controller.signal}).then(result=>{if(!result.success || !Array.isArray(result.data))throw Error();if(active){setSaved(result.data.some(item=>item._id===carId));setReady(true);}}).catch(error=>{if(active){if(error instanceof ApiError && error.status===401)setReady(true);else setError('Your saved vehicles could not be loaded.');}}).finally(()=>clearTimeout(timeout));return()=>{active=false;clearTimeout(timeout);controller.abort();};},[carId,attempt]);
  async function toggle(){if(lock.current || !ready)return;lock.current=true;setBusy(true);setError('');try{const result=await setFavoriteBrowser(carId, !saved);if(!result.success)throw Error();setSaved(result.isFavorite);}catch(error){if(error instanceof ApiError && error.status===401)router.push(signInHref(window.location.pathname + window.location.search));else setError('We couldn’t update your saved vehicles. Please try again.');}finally{lock.current=false;setBusy(false);}}
  return <div className={styles.saved}><button type='button' onClick={toggle} disabled={!ready || busy} aria-pressed={saved} className={styles.secondary}>{busy?'Updating…':!ready?'Loading saved status…':saved?'Saved to your collection':'Save this vehicle'}<span aria-hidden='true'>{saved?'♥':'♡'}</span></button>{saved && <Link className={styles.back} href='/buyer/favorites'>View your collection →</Link>}{error && <p role='alert'>{error}{!ready && <button onClick={()=>{setError('');setAttempt(value=>value+1);}}>Retry</button>}</p>}</div>;
}
