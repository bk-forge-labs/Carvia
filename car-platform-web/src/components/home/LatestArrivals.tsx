'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api/browser';
import { toggleFavoriteBrowser } from '@/lib/api/favorites';
import type { Car } from '@/types/car';
import styles from './LatestArrivals.module.css';

const money = new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
function VehiclePhoto({ src, title }: { src: string; title: string }) {
  const [failed, setFailed] = useState(false);
  return src && !failed ? <Image src={src} alt={title} width={720} height={480} unoptimized className={styles.image} onError={() => setFailed(true)} /> : <span className={styles.noImage}>Photography coming soon</span>;
}
export default function LatestArrivals({ vehicle, deal, onBrowseCars }: { vehicle: 'cars' | 'motorcycles'; deal: 'buy' | 'lease'; onBrowseCars: () => void }) {
  if (vehicle === 'motorcycles' || deal === 'lease') return <section className={styles.section} aria-labelledby='latest-arrivals-title'>
    <div className={styles.inner}><div className={styles.availability}>
      <div><p className={styles.eyebrow}>{vehicle === 'motorcycles' ? 'The motorcycle collection' : 'A different way to drive'}</p>
      <h2 id='latest-arrivals-title'>{deal === 'lease' ? 'Leasing. A chapter to come.' : 'Your next ride is on the horizon.'}</h2>
      <p>{deal === 'lease' ? 'There are no leasing offers available on Carvia yet.' : 'There are no motorcycles listed on Carvia yet.'} Your search selections are kept while you explore.</p>
      <button type='button' onClick={onBrowseCars}>Explore cars for sale <span aria-hidden='true'>↗</span></button></div>
      <span className={styles.availabilityNote}>Coming to Carvia<br /><span>{deal === 'lease' ? 'Leasing' : 'Motorcycles'}</span></span>
    </div></div>
  </section>;
  return <AvailableArrivals />;
}
function AvailableArrivals() {
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const [favoritesReady, setFavoritesReady] = useState(false);
  const [notice, setNotice] = useState('');
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    api<{ success: boolean; data: Car[] }>('/cars?sort=newest&limit=6', { signal: controller.signal })
      .then(result => { if (!result.success || !Array.isArray(result.data)) throw new Error('Unavailable'); if (active) { setCars(result.data.slice(0, 6)); setState('ready'); } })
      .catch(() => { if (active) setState('error'); }).finally(() => clearTimeout(timeout));
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [attempt]);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    api<{ success: boolean; data: Car[] }>('/favorites/me', { signal: controller.signal })
      .then(result => { if (active && result.success && Array.isArray(result.data)) setSaved(new Set(result.data.map(car => car._id))); })
      .catch(() => {}).finally(() => { clearTimeout(timeout); if (active) setFavoritesReady(true); });
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, []);
  async function save(car: Car) {
    if (busy.has(car._id)) return;
    setBusy(previous => new Set(previous).add(car._id)); setNotice('');
    try {
      const result = await toggleFavoriteBrowser(car._id);
      if (!result.success) throw new Error('Save failed');
      setSaved(previous => { const next = new Set(previous); if (result.isFavorite) next.add(car._id); else next.delete(car._id); return next; });
      setNotice(`${car.title} ${result.isFavorite ? 'saved to' : 'removed from'} your favourites.`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) router.push('/login');
      else setNotice('We couldn’t update your favourites. Please try again.');
    } finally { setBusy(previous => { const next = new Set(previous); next.delete(car._id); return next; }); }
  }
  return <section className={styles.section} aria-labelledby='latest-arrivals-title'>
    <div className={styles.inner}>
      <div className={styles.heading}><div><p className={styles.eyebrow}>Fresh to the collection</p><h2 id='latest-arrivals-title'>Latest arrivals</h2><p className={styles.intro}>New possibilities. Find the one that feels like you.</p></div><Link className={styles.all} href='/cars?sort=newest'>View all vehicles <span aria-hidden='true'>↗</span></Link></div>
      {state === 'loading' ? <div className={styles.grid} aria-label='Loading latest vehicles' aria-busy='true'>{Array.from({ length: 6 }, (_, i) => <div key={i} className={styles.skeleton} />)}</div>
        : state === 'error' ? <div className={styles.empty}><p>We couldn’t load the latest vehicles.</p><button onClick={() => { setState('loading'); setAttempt(value => value + 1); }}>Try again</button></div>
        : !cars.length ? <div className={styles.empty}><p>New arrivals will appear here as vehicles are listed.</p><Link href='/cars'>Explore vehicles ↗</Link></div>
        : <div className={styles.grid}>{cars.map(car => {
          const raw = car.mainImage || car.images?.[0] || '';
          const src = raw.startsWith('/uploads') ? `${process.env.NEXT_PUBLIC_API_ORIGIN || 'http://localhost:5050'}${raw}` : raw;
          const dealer = typeof car.dealer === 'object' ? car.dealer.name : '';
          return <article className={styles.card} key={car._id}>
            <div className={styles.media}><Link href={`/cars/${encodeURIComponent(car._id)}`} aria-label={`View ${car.title}`}>
              <VehiclePhoto key={src} src={src} title={car.title} />
            </Link><button className={styles.save} type='button' disabled={!favoritesReady || busy.has(car._id)} aria-pressed={saved.has(car._id)} aria-label={`${saved.has(car._id) ? 'Unsave' : 'Save'} ${car.title}`} onClick={() => save(car)}><svg width='19' height='19' viewBox='0 0 24 24' fill={saved.has(car._id) ? 'currentColor' : 'none'} stroke='currentColor' strokeWidth='1.5' aria-hidden='true'><path d='M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z'/></svg></button></div>
            <div className={styles.content}><h3><Link href={`/cars/${encodeURIComponent(car._id)}`}>{car.title}</Link></h3><p className={styles.price}>{typeof car.price === 'number' ? money.format(car.price) : 'Price on request'}</p>
              <dl className={styles.specs}>{[[car.year, 'Year'], [typeof car.mileage === 'number' ? `${car.mileage.toLocaleString('en-GB')} km` : '', 'Mileage'], [car.fuelType, 'Fuel'], [car.transmission, 'Transmission']].filter(([value]) => value !== '' && value != null).map(([value, label]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
              <div className={styles.seller}>{dealer && <span>{dealer}</span>}{car.location && <span>{car.location}</span>}</div>
              <Link href={`/cars/${encodeURIComponent(car._id)}`} className={styles.details}>Discover this vehicle <span aria-hidden='true'>↗</span></Link>
            </div>
          </article>;
        })}</div>}
      <p className={styles.notice} role='status'>{notice}</p>
    </div>
  </section>;
}
