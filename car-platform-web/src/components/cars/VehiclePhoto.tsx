'use client';
import { useState } from 'react';
import Image from 'next/image';
import styles from './CarCard.module.css';
export default function VehiclePhoto({ src, title }: { src: string; title: string }) {
  const [failed, setFailed] = useState(false);
  return src && !failed ? <Image src={src} alt={title} width={720} height={480} unoptimized className={styles.image} onError={() => setFailed(true)} /> : <div className={styles.placeholder}><span aria-hidden='true'>CV</span><p>Photography unavailable</p></div>;
}
