'use client';
import {usePathname,useRouter} from 'next/navigation';
import {useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AppHeader from './AppHeader';
import {logout} from '@/lib/auth/api';
import {useAuth} from '@/lib/store/auth';
import styles from '@/components/dealer/DealerWorkspace.module.css';
export default function DashboardHeader(){
 const path=usePathname(),router=useRouter();
 const clearUser=useAuth(state=>state.clearUser);
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 async function signOut(){if(busy)return;setBusy(true);setError('');try{await logout();clearUser();router.replace('/login');router.refresh();}catch{setError('Could not sign out. Please try again.');}finally{setBusy(false);}}
 if(path!=='/dealer'&&!path.startsWith('/dealer/'))return <AppHeader/>;
 return <header className={styles.workspaceHeader}><div><Link href='/' aria-label='Carvia home'><Image src='/logo/carvia-lockup-champagne.png' width={220} height={44} alt='' priority/></Link><nav aria-label='Dealer navigation'><Link href='/dealer/cars' aria-current={path.startsWith('/dealer/cars')?'page':undefined}>Inventory</Link><Link href='/cars'>View marketplace ↗</Link><button disabled={busy} onClick={signOut}>{busy?'Signing out…':'Sign out'}</button></nav></div>{error && <p role='alert'>{error}</p>}</header>;
}
