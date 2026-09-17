'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import styles from './TurntableScene.module.css';

export default function TurntableScene({ className }: { className: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [allowed, setAllowed] = useState(false);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const update = () => setAllowed(!motion.matches && !connection?.saveData);
    update();
    motion.addEventListener('change', update);
    return () => motion.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !allowed || failed) return;
    let visible = false;
    const sync = () => {
      if (visible && !document.hidden && !paused) {
        video.play().catch(error => {
          if (error instanceof DOMException && error.name === 'NotAllowedError') setPaused(true);
        });
      } else video.pause();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    }, { threshold: .1 });
    observer.observe(video);
    document.addEventListener('visibilitychange', sync);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
      video.pause();
    };
  }, [allowed, paused, failed]);

  return (
    <>
      <Image src='/brand/carvia-turntable-bk.webp' alt='' fill priority sizes='100vw' className={className} />
      {allowed && !failed && (
        <video
          ref={videoRef}
          className={`${className} ${styles.video}`}
          style={{ opacity: ready ? 1 : 0 }}
          src='/brand/carvia-turntable-bk.mp4'
          poster='/brand/carvia-turntable-bk.webp'
          muted
          playsInline
          loop
          preload='metadata'
          aria-hidden='true'
          tabIndex={-1}
          onPlaying={() => setReady(true)}
          onError={() => setFailed(true)}
        />
      )}
      {allowed && !failed && (
        <button type='button' className={styles.control} onClick={() => setPaused(value => !value)} aria-label={paused ? 'Play showroom motion' : 'Pause showroom motion'}>
          <svg width='12' height='12' viewBox='0 0 16 16' fill='currentColor' aria-hidden='true'>
            {paused ? <path d='M4 2 13 8 4 14Z' /> : <path d='M3 2h3v12H3zm7 0h3v12h-3z' />}
          </svg>
          {paused ? 'Play motion' : 'Pause motion'}
        </button>
      )}
    </>
  );
}
