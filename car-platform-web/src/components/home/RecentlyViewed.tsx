'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api/browser';
import type { Car } from '@/types/car';
import styles from './DiscoveryExperience.module.css';

type ViewedVehicle = { id: string; title: string; image: string };
const storageKey = 'carvia:recently-viewed:v1';
const changed = 'carvia:recently-viewed';
function snapshot() {
  try { return localStorage.getItem(storageKey) || '[]'; } catch { return '[]'; }
}
function parse(raw: string): ViewedVehicle[] {
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? value.filter((item): item is ViewedVehicle => item && typeof item.id === 'string' && typeof item.title === 'string' && typeof item.image === 'string').slice(0, 4) : [];
  } catch { return []; }
}
function subscribe(notify: () => void) {
  window.addEventListener('storage', notify);
  window.addEventListener(changed, notify);
  return () => { window.removeEventListener('storage', notify); window.removeEventListener(changed, notify); };
}
const serverSnapshot = () => '[]';

export function RecordVehicleView({ id, title, image }: ViewedVehicle) {
  useEffect(() => {
    try {
      const history = parse(snapshot()).filter(item => item.id !== id);
      localStorage.setItem(storageKey, JSON.stringify([{ id, title, image }, ...history].slice(0, 4)));
      window.dispatchEvent(new Event(changed));
    } catch { /* Browsing remains available when storage is disabled. */ }
  }, [id, title, image]);
  return null;
}

export default function RecentlyViewed() {
  const raw = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const [verified, setVerified] = useState<{ key: string; items: ViewedVehicle[] }>({ key: '[]', items: [] });
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    Promise.all(parse(raw).map(async item => {
      try {
        const response = await api<{ success: boolean; data: Car }>(`/cars/${encodeURIComponent(item.id)}`, { signal: controller.signal });
        return response.success && response.data ? { id: response.data._id, title: response.data.title, image: response.data.mainImage || response.data.images?.[0] || '' } : null;
      } catch { return null; }
    })).then(items => { if (active) setVerified({ key: raw, items: items.filter((item): item is ViewedVehicle => item !== null) }); }).finally(() => clearTimeout(timeout));
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [raw]);
  const checking = verified.key !== raw;
  const history = checking ? [] : verified.items;
  return <>
    <div className={styles.sectionHeading}>
      <div><p className={styles.eyebrow}>Your collection</p><h2 id='body-style-title'>Recently viewed</h2></div>
      {history.length > 0 && <button type='button' className={styles.clearHistory} onClick={() => {
        try { localStorage.removeItem(storageKey); window.dispatchEvent(new Event(changed)); } catch { /* Storage may be disabled. */ }
      }}>Clear history</button>}
    </div>
    {checking ? <div className={styles.recentEmpty} role='status'>Checking your recently viewed vehicles…</div> : history.length ? <div className={styles.categoryGrid}>
      {history.map(item => {
        const raw = item.image;
        const image = raw.startsWith('/uploads') ? `${process.env.NEXT_PUBLIC_API_ORIGIN || 'http://localhost:5050'}${raw}` : raw;
        const safeImage = /^https?:\/\//.test(image) || (image.startsWith('/') && !image.startsWith('//'));
        return <Link className={styles.recentCard} href={`/cars/${encodeURIComponent(item.id)}`} key={item.id}>
          <div className={styles.recentImage}>
            {safeImage ? <Image src={image} alt='' width={640} height={426} unoptimized loading='lazy' onError={event => { event.currentTarget.style.visibility = 'hidden'; }} /> : <span>Carvia collection</span>}
          </div>
          <div className={styles.recentCopy}><h3>{item.title}</h3><span>View vehicle <span aria-hidden='true'>↗</span></span></div>
        </Link>;
      })}
    </div> : <div className={styles.recentEmpty}>
      <div><h3>Your next chapter is waiting.</h3><p>Vehicles you open will appear here, ready for another look.</p></div>
      <Link href='/cars'>Explore vehicles <span aria-hidden='true'>↗</span></Link>
    </div>}
  </>;
}
