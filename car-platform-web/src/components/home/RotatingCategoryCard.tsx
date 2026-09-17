'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './SuvCategoryCard.module.css';

export default function RotatingCategoryCard({ category, model, motionLabel }: { category: string; model: 'suv' | 'sedan' | 'electric' | 'luxury' | 'sports' | 'van'; motionLabel: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [allowed, setAllowed] = useState(false);
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setAllowed(!query.matches);
    update(); query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !allowed || failed) return;
    let visible = false;
    const sync = () => {
      if (visible && !document.hidden && !paused) video.play().catch(() => setPaused(true));
      else video.pause();
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: .25 });
    observer.observe(video); document.addEventListener('visibilitychange', sync);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', sync); video.pause(); };
  }, [allowed, paused, failed]);
  return (
    <div className={styles.card}>
      <Link href={`/cars?category=${encodeURIComponent(category)}`} className={styles.link}>
        <div className={styles.visual}>
          <Image src={`/brand/categories/${model}.webp`} alt='' fill sizes='(max-width: 639px) 280px, 180px' className={styles.media} />
          {allowed && !failed && <video ref={videoRef} className={styles.media} src={`/brand/categories/${model}.mp4`} poster={`/brand/categories/${model}.webp`} loop muted playsInline preload='metadata' aria-hidden='true' tabIndex={-1} onError={() => setFailed(true)} />}
        </div>
        <span className={styles.label}>{category}</span>
      </Link>
      {allowed && !failed && <button className={styles.control} type='button' aria-label={`${paused ? 'Play' : 'Pause'} ${motionLabel} rotation`} onClick={() => setPaused(value => !value)}>
        <svg width='10' height='10' viewBox='0 0 16 16' fill='currentColor' aria-hidden='true'>{paused ? <path d='M4 2 13 8 4 14Z' /> : <path d='M3 2h3v12H3zm7 0h3v12h-3z' />}</svg>
      </button>}
    </div>
  );
}
