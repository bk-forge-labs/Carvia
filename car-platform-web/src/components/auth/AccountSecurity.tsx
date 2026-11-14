'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {useQueryClient} from '@tanstack/react-query';
import { api } from '@/lib/api/browser';
import { useAuth } from '@/lib/store/auth';
import styles from './AccountSettings.module.css';
export default function AccountSecurity() {
  const router = useRouter();
  const client=useQueryClient(),lock=useRef(false);
  const [showPassword,setShowPassword]=useState(false);
  const [loadError,setLoadError]=useState(false);
  const clearUser = useAuth(s => s.clearUser);
  const [status, setStatus] = useState<{emailVerified:boolean;emailDeliveryAvailable:boolean}|null>(null);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => { const controller = new AbortController(); api<{emailVerified:boolean;emailDeliveryAvailable:boolean}>('/auth/security',{signal:controller.signal}).then(setStatus).catch(() => {if(!controller.signal.aborted)setLoadError(true);}); return () => controller.abort(); }, [attempt]);
  async function verify() { if(lock.current)return;lock.current=true;setBusy(true); setNotice(''); try {const result=await api<{message:string}>('/auth/verification-email',{method:'POST'});setNotice(result.message);}catch(error){setNotice(error instanceof Error?error.message:'Could not send verification.');}finally{lock.current=false;setBusy(false);} }
  async function change(event:React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if(lock.current)return;
    const form=new FormData(event.currentTarget);
    if(form.get('password')!==form.get('confirmation')){setNotice('The new passwords do not match.');return;}
    if(new TextEncoder().encode(String(form.get('password'))).length>72){setNotice('Use a password of at most 72 UTF-8 bytes. Accented characters and symbols can use more than one byte.');return;}
    lock.current=true;setBusy(true);setNotice('');
    try{await api('/auth/change-password',{method:'POST',body:{currentPassword:form.get('currentPassword'),password:form.get('password')}});await client.cancelQueries();client.clear();clearUser();router.replace('/login');router.refresh();}
    catch(error){setNotice(error instanceof Error?error.message:'Could not change password.');}finally{lock.current=false;setBusy(false);}
  }
  return <section className={styles.card}><p className={styles.eyebrow}>Account security</p><h2>Keep your account protected.</h2>
    {status?<><p>{status.emailVerified?'Your email address is verified.':'Your email address has not been verified.'}</p>{!status.emailVerified&&(status.emailDeliveryAvailable?<button disabled={busy} onClick={verify}>Send verification email</button>:<p className={styles.note}>Verification email is temporarily unavailable. Please try again later.</p>)}</>:loadError?<div role='alert'><p>Could not load account security.</p><button type='button' onClick={()=>{setLoadError(false);setAttempt(n=>n+1);}}>Retry security check</button></div>:<p role='status' className={styles.note}>Checking email verification…</p>}
    <details className={styles.passwordPanel}><summary>Change your password</summary><form onSubmit={change} className={styles.passwordForm}><label>Current password<input name='currentPassword' type={showPassword?'text':'password'} autoComplete='current-password' required disabled={busy}/></label><label>New password<input name='password' type={showPassword?'text':'password'} autoComplete='new-password' minLength={12} required disabled={busy}/></label><label>Confirm new password<input name='confirmation' type={showPassword?'text':'password'} autoComplete='new-password' minLength={12} required disabled={busy}/></label><button type='button' className={styles.secondary} aria-pressed={showPassword} onClick={()=>setShowPassword(v=>!v)}>{showPassword?'Hide passwords':'Show passwords'}</button><p className={styles.note}>Use at least 12 characters. Changing your password signs out all existing sessions.</p><button disabled={busy}>{busy?'Please wait…':'Change password'}</button></form></details>
    {notice&&<p role='status'>{notice}</p>}
  </section>;
}
