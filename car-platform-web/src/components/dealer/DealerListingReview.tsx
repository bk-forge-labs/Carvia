import Link from 'next/link';
import type {Car} from '@/types/car';
import {CarGallery} from '@/components/cars/CarGallery';
import DealerPublishAction from './DealerPublishAction';
import styles from './DealerWorkspace.module.css';
import formStyles from './DealerCarCreateForm.module.css';
import review from './DealerListingReview.module.css';
export default function DealerListingReview({car,readiness}:{car:Car;readiness:{ready:boolean;issues:string[]}}){
 const id=car._id;
 const facts=[['Make',car.brand],['Model',car.model],['Model year',car.year],['Mileage',typeof car.mileage==='number'?`${car.mileage.toLocaleString('en-GB')} km`:null],['Body style',car.bodyStyle],['Fuel',car.fuelType],['Transmission',car.transmission],['Seller type',car.owner],['Smoking history',car.condition]].filter(([,value])=>value!==undefined&&value!==null&&value!=='');
 return <main className={styles.page}><div className={styles.inner}>
 <Link href='/dealer/cars' className={styles.back}>← Back to inventory</Link>
 <header className={styles.heading}><div><p className={styles.eyebrow}>Your vehicle listing</p><h1>{car.title}</h1><p className={styles.intro}>{car.isDemo?'Sample vehicle—not for sale. All specifications are fictional.':'Review the saved details before sharing this vehicle with buyers.'}</p></div><p className={styles.price}>{new Intl.NumberFormat('en-DE',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(car.price)}</p></header>
 {!car.isPublished&&<ol className={formStyles.steps} aria-label="Listing progress"><li><span>01</span> Vehicle details</li><li><span>02</span> Photos</li><li aria-current="step"><span>03</span> Review & publish</li></ol>}
 <div className={styles.detail}><div><CarGallery title={car.title} apiOrigin={process.env.NEXT_PUBLIC_API_ORIGIN||'http://localhost:5050'} mainImage={car.mainImage} images={car.images}/></div>
 <aside className={styles.side}><section className={styles.panel}>
 <p className={styles.eyebrow}>Review & publish</p><span className={styles.badge} data-live={!!car.isPublished}>{car.isPublished?'Published':'Private draft'}</span>
 <h2 className={review.title}>{car.isPublished?'Your listing is live.':readiness.ready?'Ready for your final review.':'A few details need attention.'}</h2>
 <p>{car.isPublished?'Buyers can explore this vehicle in the public collection.':readiness.ready?'The required checks passed. Review the photos, price and details before publishing.':'Resolve the items below, then return here to publish.'}</p>
 {readiness.issues.length>0?<ul className={review.issues}>{readiness.issues.map(issue=><li key={issue}>{issue}</li>)}</ul>:<ul className={review.checks}><li>Vehicle identity, price & mileage</li><li>Uploaded photos & selected cover</li><li>Dealer approval & review status</li></ul>}
 <div className={review.editLinks}><Link href={`/dealer/cars/${id}/edit`} className={styles.secondary}>Edit vehicle details</Link><Link href={`/dealer/cars/${id}/images`} className={styles.secondary}>Manage photographs</Link></div>
 <DealerPublishAction key={`${id}-${car.isPublished}`} carId={id} isPublished={!!car.isPublished} ready={readiness.ready}/>
 {car.isPublished&&<Link href={`/cars/${id}`} className={styles.back}>View public listing ↗</Link>}
 </section></aside></div>
 <section className={`${styles.panel} ${styles.below}`}><p className={styles.eyebrow}>Listing information</p><h2>At a glance.</h2><dl className={styles.facts}>{facts.map(([label,value])=><div key={String(label)}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>
 <section className={`${styles.panel} ${styles.below}`}><p className={styles.eyebrow}>Your description</p><h2>About this vehicle.</h2><p className={styles.description}>{car.description?.trim() || 'No description yet. Add details that help buyers understand this vehicle.'}</p></section>
 </div></main>;
}
