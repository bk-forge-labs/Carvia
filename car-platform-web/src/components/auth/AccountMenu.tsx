'use client';
import EnquiryCount from '@/components/enquiries/EnquiryCount';
import {useEffect,useId,useRef,useState} from 'react';
import Link from 'next/link';
import {usePathname,useRouter} from 'next/navigation';
import {useQueryClient} from '@tanstack/react-query';
import {useAuth} from '@/lib/store/auth';
import {logout} from '@/lib/auth/api';
import styles from './AccountMenu.module.css';
export default function AccountMenu(){
 const user=useAuth(s=>s.user),hydrated=useAuth(s=>s.hasHydrated),clearUser=useAuth(s=>s.clearUser);
 const path=usePathname(),router=useRouter(),client=useQueryClient(),id=useId();
 const [openPath,setOpenPath]=useState<string|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const open=openPath===path,root=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null),lock=useRef(false);
 useEffect(()=>{if(!open)return;function outside(e:PointerEvent){if(!root.current?.contains(e.target as Node))setOpenPath(null);}function escape(e:KeyboardEvent){if(e.key==='Escape'){setOpenPath(null);trigger.current?.focus();}}document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};},[open]);
 async function signOut(){if(lock.current)return;lock.current=true;setBusy(true);setError('');try{await logout();await client.cancelQueries();client.clear();clearUser();setOpenPath(null);router.replace('/login');router.refresh();}catch{setError('Could not sign out. Please try again.');}finally{lock.current=false;setBusy(false);}}
 if(!hydrated)return <span className={styles.placeholder} aria-label='Loading account'/>;
 if(!user)return <Link className={styles.signIn} href='/login'>Sign in</Link>;
 const workspace=user.role==='dealer'?'/dealer':user.role==='admin'?'/admin':'/buyer';
 return <div className={styles.root} ref={root} onBlur={e=>{if(e.relatedTarget&&!root.current?.contains(e.relatedTarget as Node))setOpenPath(null);}}><button ref={trigger} type='button' className={styles.trigger} aria-label='My account' aria-expanded={open} aria-controls={id} onClick={()=>setOpenPath(open?null:path)}><span className={styles.avatar} aria-hidden='true'>{user.name.trim().slice(0,1).toUpperCase()}</span><span className={styles.label}>My account</span><span aria-hidden='true'>⌄</span></button>{open&&<div className={styles.panel} id={id}><div className={styles.identity}><strong>{user.name}</strong><span>{user.email}</span><small>{user.role} account</small></div><nav aria-label='Account navigation'><Link href='/account' onClick={()=>setOpenPath(null)}>Manage account <span aria-hidden='true'>↗</span></Link><Link href={workspace} onClick={()=>setOpenPath(null)}>{user.role==='buyer'?'My overview':'My workspace'} <span aria-hidden='true'>↗</span></Link>{user.role==='buyer'&&<Link href='/buyer/favorites' onClick={()=>setOpenPath(null)}>Saved vehicles</Link>}{user.role!=='admin'&&<Link href={`/${user.role}/enquiries`} onClick={()=>setOpenPath(null)}>My enquiries{user.role==='dealer'&&<EnquiryCount/>}</Link>}</nav><button className={styles.signOut} disabled={busy} onClick={signOut}>{busy?'Signing out…':'Sign out'} <span aria-hidden='true'>→</span></button>{error&&<p role='alert'>{error}</p>}</div>}</div>;
}
