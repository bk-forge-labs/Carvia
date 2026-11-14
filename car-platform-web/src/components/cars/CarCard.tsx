import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Car } from '@/types/car';
import VehiclePhoto from './VehiclePhoto';
import FavoriteButton from './FavoriteButton';
import styles from './CarCard.module.css';
const money = new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
export default function CarCard({ car, action, searchQuery }: { car: Car; action?: ReactNode; searchQuery?: string }) {
  const raw = car.mainImage || car.images?.[0] || '';
  const src = raw.startsWith('/uploads/') ? `${process.env.NEXT_PUBLIC_API_ORIGIN || 'http://localhost:5050'}${raw}` : raw;
  const href = `/cars/${encodeURIComponent(car._id)}${searchQuery ? `?${searchQuery}` : ''}`;
  return <article className={styles.card}>
    <Link href={href} className={styles.media} aria-label={`View ${car.title}`}><VehiclePhoto key={src} src={src} title={car.title} /></Link>
    <div className={styles.content}><p className={styles.make}>{car.brand}</p>{car.isDemo && <p style={{color:'#ddc49e',fontSize:12,marginBottom:12}}>Sample vehicle—not for sale</p>}<h2><Link href={href}>{car.title}</Link></h2>
      <p className={styles.price}>{typeof car.price === 'number' ? money.format(car.price) : 'Price on request'}</p>
      <dl className={styles.specs}>{[[car.year, 'Year'], [typeof car.mileage === 'number' ? `${car.mileage.toLocaleString('en-GB')} km` : '', 'Mileage'], [car.fuelType, 'Fuel'], [car.transmission, 'Transmission']].filter(([value]) => value !== '' && value != null).map(([value,label]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      {car.location && <p className={styles.location}>{car.location}</p>}
      <Link href={href} className={styles.details}>Discover this vehicle <span aria-hidden='true'>↗</span></Link>
    </div><div className={styles.action}>{action || <FavoriteButton carId={car._id} title={car.title} compact/>}{car.isDemo?<span className={styles.enquiryUnavailable}>Enquiries unavailable for sample vehicles</span>:<Link href={`${href}#vehicle-enquiry`} className={styles.enquire} aria-label={`Enquire about ${car.title}`}>Enquire <span aria-hidden='true'>↗</span></Link>}</div>
  </article>;
}
