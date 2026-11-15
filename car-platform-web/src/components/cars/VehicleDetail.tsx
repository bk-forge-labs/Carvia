import Link from 'next/link';
import type { Car } from '@/types/car';
import { CarGallery } from './CarGallery';
import CarCard from './CarCard';
import FavoriteButton from './FavoriteButton';
import SellerEnquiry from './SellerEnquiry';
import { RecordVehicleView } from '@/components/home/RecentlyViewed';
import { HomeFooter } from '@/components/home/HomeClosing';
import styles from './VehicleDetail.module.css';
type Profile={companyName?:string;phone?:string;address?:string};
export default function VehicleDetail({car,profile,similar=[],backHref='/cars'}:{car:Car;profile?:Profile|null;similar?:Car[];backHref?:string}) {
  const seller=typeof car.dealer==='object'?car.dealer:null;
  const price=Number.isFinite(car.price)?new Intl.NumberFormat('en-DE',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(car.price):'Price on request';
  const facts=[['Make',car.brand],['Model',car.model],['Model year',car.year],['Mileage',typeof car.mileage==='number'?`${car.mileage.toLocaleString('en-GB')} km`:null],['Body style',car.bodyStyle],['Fuel',car.fuelType],['Transmission',car.transmission],['Exterior colour',car.exteriorColor],['Seats',car.seats],['Doors',car.doors],['Seller type',car.owner],['Smoking history',car.condition]].map(([label,value])=>[label,value===undefined||value===null||value===''?'Not supplied':value]);
  return <><main id='carvia-home' className={styles.page}><div className={styles.inner}>
    {car.isDemo && <p className={styles.contactNote}>Sample vehicle—not for sale. Prices and specifications are fictional; images are illustrative.</p>}
    <RecordVehicleView id={car._id} title={car.title} image={car.mainImage || car.images?.[0] || ''}/>
    <Link href={backHref} className={styles.back}>{backHref === '/buyer/favorites' ? '← Back to your collection' : '← Back to results'}</Link>
    <header className={styles.heading}><div><p className={styles.eyebrow}>The Veltrenne collection</p><h1>{car.title}</h1><p className={styles.summary}>{[car.brand,car.model,car.year,typeof car.mileage==='number'?`${car.mileage.toLocaleString('en-GB')} km`:null].filter(value=>value!==undefined && value!==null && value!=='').join(' · ')}</p></div><div><p className={styles.price}>{price}</p><p className={styles.priceNote}>Seller’s asking price</p></div></header>
    <div className={styles.layout}><div className={styles.media}>
      <CarGallery key={car._id} title={car.title} apiOrigin={process.env.NEXT_PUBLIC_API_ORIGIN || 'http://localhost:5050'} mainImage={car.mainImage} images={car.images} categories={car.photoCategories}/>{car.imageCredit && <p className={styles.contactNote}>Photo: {car.imageCredit.author} · <a href={car.imageCredit.source}>Original photograph</a> · <a href={car.imageCredit.licenseUrl || car.imageCredit.source}>{car.imageCredit.license}</a>. Display cropped to fit.</p>}</div><div className={styles.details}>
      <section className={styles.panel} aria-labelledby='vehicle-details'><p className={styles.eyebrow}>The details that matter</p><h2 id='vehicle-details'>At a glance.</h2><dl className={styles.facts}>{facts.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>
      <details className={styles.panel}><summary>Condition, charges and supporting evidence</summary><p>Condition report: {car.conditionReport||'Not supplied.'}</p><p>Additional charges: {car.disclosedCharges||'Not supplied. Ask the dealer for the full payable amount.'}</p><p>No approved public documents supplied. Private dealer documents are not public vehicle evidence.</p></details>
      <section className={styles.panel} aria-labelledby='seller-description'><p className={styles.eyebrow}>In the seller’s words</p><h2 id='seller-description'>About this vehicle.</h2><p className={styles.contactNote}>Information supplied by the dealer. Veltrenne has not independently verified the vehicle’s condition or history.</p><p className={styles.description}>{car.description?.trim() || 'The seller has not added a description yet. Contact them for more details about this vehicle.'}</p></section>
    </div><aside className={styles.aside}><div className={styles.sticky}><section className={styles.panel}><p className={styles.eyebrow}>Start a conversation</p><h2>{profile?.companyName || seller?.name || 'Contact the seller'}</h2>{profile?.address && <p className={styles.address}>{profile.address}</p>}<a className={styles.primary} href='#vehicle-enquiry'>Enquire about this vehicle <span aria-hidden='true'>↗</span></a>{car.testDriveEligible===true&&<Link className={styles.primary} href='#vehicle-enquiry'>Request a test drive — start a conversation</Link>}<FavoriteButton key={car._id} carId={car._id}/><p className={styles.contactNote}>Ask about availability, arrange a viewing, or discuss the details directly with the seller.</p></section></div></aside></div>
    {!car.isDemo && <SellerEnquiry carId={car._id} title={car.title} email={seller?.email} phone={profile?.phone}/>}
    {car.isDemo && <section id='vehicle-enquiry' className={styles.panel}><h2>Sample listing.</h2><p>This vehicle is not for sale. Seller contact is unavailable for sample inventory.</p></section>}
    {!!similar.length && <section className={styles.related}><p className={styles.eyebrow}>Continue exploring</p><h2>More from {car.brand || 'the collection'}.</h2><div>{similar.map(item=><CarCard key={item._id} car={item}/>)}</div></section>}
  </div></main><HomeFooter/></>;
}
