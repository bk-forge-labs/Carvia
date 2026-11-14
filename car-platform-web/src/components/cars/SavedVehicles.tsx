'use client';
import Link from 'next/link';
import {useQueryClient} from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { api, ApiError } from '@/lib/api/browser';
import { setFavoriteBrowser } from '@/lib/api/favorites';
import { signInHref } from '@/lib/auth/returnTo';
import type { Car } from '@/types/car';
import CarCard from './CarCard';
import styles from './Collection.module.css';
export default function SavedVehicles() {
  const queryClient=useQueryClient();
  const [cars,setCars] = useState<Car[]>([]);
  const [state,setState] = useState<'loading'|'ready'|'guest'|'error'>('loading');
  const [attempt,setAttempt] = useState(0);
  const [pending,setPending] = useState<string[]>([]);
  const [errors,setErrors] = useState<Record<string,string>>({});
  const [notice,setNotice] = useState('');
  const locks = useRef(new Set<string>());
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timer = setTimeout(() => controller.abort(),10000);
    api<{success:boolean;data:Car[]}>('/favorites/me',{signal:controller.signal}).then(result => {
      if (!result.success || !Array.isArray(result.data)) throw Error('Invalid collection');
      if (active) { setCars(result.data); setState('ready'); }
    }).catch(error => { if (active) setState(error instanceof ApiError && error.status === 401 ? 'guest' : 'error'); }).finally(() => clearTimeout(timer));
    return () => { active=false; clearTimeout(timer); controller.abort(); };
  },[attempt]);
  async function remove(car:Car) {
    if (locks.current.has(car._id)) return;
    locks.current.add(car._id); setPending(ids => [...ids,car._id]); setErrors(values => ({...values,[car._id]:''}));
    try {
      const result=await setFavoriteBrowser(car._id,false);
      if (!result.success || result.isFavorite) throw Error('Removal failed');
      void queryClient.invalidateQueries({queryKey:['favorites']});
      setCars(items => items.filter(item => item._id !== car._id)); setNotice(`${car.title} removed from your collection.`); heading.current?.focus();
    } catch(error) {
      if (error instanceof ApiError && error.status===401) {setCars([]);setState('guest');}
      else setErrors(values => ({...values,[car._id]:'This vehicle could not be removed. Please try again.'}));
    } finally {locks.current.delete(car._id);setPending(ids => ids.filter(id => id!==car._id));}
  }
  return <main className={styles.page}><div className={styles.inner}>
    <p className={styles.eyebrow}>Your Veltrenne</p><div className={styles.toolbar}><h1 ref={heading} tabIndex={-1}>Your collection.</h1><Link className={styles.link} href='/cars'>Explore vehicles ↗</Link></div>
    <p className={styles.intro}>The vehicles you want to come back to. Only available listings appear here.</p>
    <p className={styles.status} role='status'>{notice || (state==='ready' ? `${cars.length} saved ${cars.length===1?'vehicle':'vehicles'}` : '')}</p>
    {state==='loading' && <p role='status'>Loading your collection…</p>}
    {state==='guest' && <section className={styles.empty}><h2>A place for your favourites.</h2><p>Sign in to see the vehicles you’ve saved.</p><Link className={styles.primary} href={signInHref('/buyer/favorites')}>Sign in to your collection</Link></section>}
    {state==='error' && <section className={styles.empty}><h2>Your collection couldn’t load.</h2><p role='alert'>Please try again. Your saved vehicles have not been changed.</p><button className={styles.primary} onClick={()=>{setState('loading');setAttempt(value=>value+1);}}>Try again</button></section>}
    {state==='ready' && (cars.length ? <section className={styles.grid} aria-label='Saved vehicles'>{cars.map(car=><CarCard key={car._id} car={car} searchQuery='from=collection' action={<><button className={styles.remove} disabled={pending.includes(car._id)} aria-label={`Remove ${car.title} from collection`} onClick={()=>remove(car)}>{pending.includes(car._id)?'Removing…':'Remove from collection'}</button>{errors[car._id] && <p className={styles.error} role='alert'>{errors[car._id]}</p>}</>}/>)}</section> : <section className={styles.empty}><h2>Find something worth keeping.</h2><p>Save a vehicle while browsing or from its detail page and it will appear here.</p><Link className={styles.primary} href='/cars'>Explore vehicles ↗</Link></section>)}
  </div></main>;
}
