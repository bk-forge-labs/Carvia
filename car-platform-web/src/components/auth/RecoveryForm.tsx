'use client';
import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api/browser';
import { useAuth } from '@/lib/store/auth';
import styles from '@/components/cars/Collection.module.css';
export default function RecoveryForm({mode}:{mode:'forgot'|'reset'|'verify'}) {
 const [busy,setBusy]=useState(false),[notice,setNotice]=useState(''),[error,setError]=useState(''),[done,setDone]=useState(false);
 const clearUser=useAuth(s=>s.clearUser);
 async function submit(event:React.FormEvent<HTMLFormElement>){event.preventDefault();if(busy)return;const form=new FormData(event.currentTarget);setError('');setNotice('');
  if(mode==='reset'&&form.get('password')!==form.get('confirmation')){setError('The passwords do not match.');return;}
  setBusy(true);
  try{const result=await api<{message:string}>(mode==='forgot'?'/auth/forgot-password':mode==='reset'?'/auth/reset-password':'/auth/verify-email',{method:'POST',body:mode==='forgot'?{email:form.get('email')}:{token:window.location.hash.slice(1),password:form.get('password')}});setNotice(result.message);setDone(true);if(mode!=='forgot')window.history.replaceState(null,'',window.location.pathname);if(mode==='reset')clearUser();}
  catch(error){setError(error instanceof Error?error.message:'Please try again.');}finally{setBusy(false);}
 }
 return <main className={styles.auth}><section className={styles.authPanel}><p className={styles.eyebrow}>Your Veltrenne</p><h1>{mode==='forgot'?'Find your way back.':mode==='reset'?'A fresh start.':'Make it yours.'}</h1><p className={styles.intro}>{mode==='forgot'?'Enter your account email to request a password reset link.':mode==='reset'?'Choose a new password of at least 12 characters.':'Confirm ownership of your email address to protect your account.'}</p>
 {!done&&<form className={styles.form} onSubmit={submit}>{mode==='forgot'?<label>Email address<input name='email' type='email' autoComplete='email' required/></label>:mode==='reset'?<><label>New password<input name='password' type='password' autoComplete='new-password' minLength={12} required/></label><label>Confirm password<input name='confirmation' type='password' autoComplete='new-password' minLength={12} required/></label></>:null}<button className={styles.primary} disabled={busy}>{busy?'Please wait…':mode==='forgot'?'Send reset link':mode==='reset'?'Reset password':'Verify email'}</button></form>}
 {error&&<p role='alert' className={styles.error}>{error}</p>}{notice&&<p role='status' className={styles.intro}>{notice}</p>}
 <Link className={styles.link} href={mode==='verify'?'/account':'/login'}>{mode==='verify'?'Manage account':'Back to sign in'} →</Link>{mode==='reset'&&error&&<Link className={styles.link} href='/forgot-password'>Request a new link</Link>}
 </section></main>;
}
