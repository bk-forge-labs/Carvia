import Link from 'next/link';
import type { Car } from '@/types/car';
import PublishToggleButton from './PublishToggleButton';
import DeleteCarButton from './DeleteCarButton';
import VehiclePhoto from '@/components/cars/VehiclePhoto';
import styles from './DealerWorkspace.module.css';
export default function DealerCarCard({car}:{car:Car}) {
 const href=`/dealer/cars/${car._id}`;
 const raw=car.mainImage || car.images?.[0] || '';
 const src=raw.startsWith('/uploads/')?`${process.env.NEXT_PUBLIC_API_ORIGIN || 'http://localhost:5050'}${raw}`:raw;
 return <article className={styles.card}>
  <Link href={href} className={styles.photo} aria-label={`Manage ${car.title}`}><VehiclePhoto src={src} title={car.title}/></Link>
  <div className={styles.content}><div className={styles.statusRow}><span className={styles.brand}>{car.brand}</span><span className={styles.badge} data-live={!!car.isPublished}>{car.isPublished?'Published':'Draft'}</span></div>
   <h2><Link href={href}>{car.title}</Link></h2><p className={styles.meta}>{[car.year,car.bodyStyle,typeof car.mileage==='number'?`${car.mileage.toLocaleString('en-GB')} km`:null].filter(Boolean).join(' · ')}</p>
   <p className={styles.price}>{new Intl.NumberFormat('en-DE',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(car.price)}</p>
   {car.isDemo && <p className={styles.demo}>Sample vehicle—not for sale</p>}
   <div className={styles.actions}><Link href={href} className={styles.primary}>Manage listing <span aria-hidden='true'>↗</span></Link><div className={styles.links}><Link href={`${href}/edit`} className={styles.secondary}>Edit details</Link><Link href={`${href}/images`} className={styles.secondary}>Photos</Link></div><div className={styles.controls}><PublishToggleButton carId={car._id} isPublished={!!car.isPublished}/><DeleteCarButton carId={car._id}/></div></div>
  </div>
 </article>;
}
