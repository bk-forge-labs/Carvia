import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Car } from '@/types/car';
import VehiclePhoto from './VehiclePhoto';
import FavoriteButton from './FavoriteButton';
import styles from './CarCard.module.css';
const money = new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
export default function CarCard({ car, action, searchQuery }: { car: Car; action?: ReactNode; searchQuery?: string }) {
  if(car.isUnavailable)return <article className={styles.card}><div className={styles.content}><h2>Unavailable saved vehicle</h2><p>This listing is no longer public. Your private concerns remain available in your decision space.</p>{action}</div></article>;
  const raw = car.mainImage || car.images?.[0] || '';
  const src = raw.startsWith('/uploads/') ? `${process.env.NEXT_PUBLIC_API_ORIGIN || 'http://localhost:5050'}${raw}` : raw;
  const href = `/cars/${encodeURIComponent(car._id)}${searchQuery ? `?${searchQuery}` : ''}`;
  const preferences=new URLSearchParams(searchQuery||'');
  const reasons=([['transmission','Transmission'],['fuelType','Fuel'],['bodyStyle','Body type']] as const).filter(([key])=>preferences.has(key)).map(([key,label])=>`${label}: ${car[key]||'not supplied'}${car[key]?car[key]===preferences.get(key)?' — matches your preference':' — differs from your preference':''}`);
  return <article className={styles.card}>
    <Link href={href} className={styles.media} aria-label={`View ${car.title}`}><VehiclePhoto key={src} src={src} title={car.title} /></Link>
    <div className={styles.content}><p className={styles.make}>{car.brand}</p>{car.isDemo && <p className={styles.sample}>Sample vehicle—not for sale</p>}<h2><Link href={href}>{car.title}</Link></h2>
      <p className={styles.price}>{typeof car.price === 'number' ? money.format(car.price) : 'Price on request'}</p>
      <dl className={styles.specs}>{[[car.year, 'Year'], [typeof car.mileage === 'number' ? `${car.mileage.toLocaleString('en-GB')} km` : '', 'Mileage'], [car.fuelType, 'Fuel'], [car.transmission, 'Transmission']].filter(([value]) => value !== '' && value != null).map(([value,label]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      {!!reasons.length&&<p className={styles.location}>{reasons.join(' · ')}</p>}
      {car.location && <p className={styles.location}>{car.location}</p>}
      <Link href={href} className={styles.details}>Discover this vehicle <span aria-hidden='true'>↗</span></Link>
    </div><div className={styles.action}>{action || <FavoriteButton carId={car._id} title={car.title} compact/>}{car.isDemo?<span className={styles.enquiryUnavailable}>Enquiries unavailable for sample vehicles</span>:<Link href={`${href}#vehicle-enquiry`} className={styles.enquire} aria-label={`Enquire about ${car.title}`}>Enquire <span aria-hidden='true'>↗</span></Link>}</div>
  </article>;
}
