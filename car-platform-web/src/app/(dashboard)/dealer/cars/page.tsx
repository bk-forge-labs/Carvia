import Link from 'next/link';
import DealerCarCard from '@/components/dealer/DealerCarCard';
import {getDealerCarsServer} from '@/lib/api/dealerCars.server';
import type {Car} from '@/types/car';
import styles from '@/components/dealer/DealerWorkspace.module.css';
export default async function DealerCarsPage({searchParams}:{searchParams:Promise<{status?:string}>}) {
 const [res,query]=await Promise.all([getDealerCarsServer(),searchParams]);
 const cars:Car[]=res.data ?? [];
 const status=['published','draft'].includes(query.status || '')?query.status:'all';
 const published=cars.filter(car=>car.isPublished).length;
 const shown=cars.filter(car=>status==='all'||(status==='published'?car.isPublished:!car.isPublished));
 return <main className={styles.page}><div className={styles.inner}><p className={styles.eyebrow}>Dealer workspace</p><header className={styles.heading}><div><h1>Your inventory.</h1><p className={styles.intro}>Prepare each listing, manage its photographs, and choose when it goes live.</p></div><Link href='/dealer/cars/new' className={styles.primary}>Add a vehicle <span aria-hidden='true'>＋</span></Link></header>
 <nav className={styles.tabs} aria-label='Inventory status'>{[['all','All vehicles',cars.length],['published','Published',published],['draft','Drafts',cars.length-published]].map(([value,label,count])=><Link key={value} href={value==='all'?'/dealer/cars':`/dealer/cars?status=${value}`} aria-current={status===value?'page':undefined}>{label}<span>{count}</span></Link>)}</nav>
 {shown.length?<section className={styles.grid} aria-label='Your vehicles'>{shown.map(car=><DealerCarCard key={car._id} car={car}/>)}</section>:<section className={`${styles.panel} ${styles.empty}`}><h2>{status==='all'?'Your collection starts here.':status==='draft'?'No drafts waiting.':'No vehicles published yet.'}</h2><p>{status==='published'?'Open a draft, complete its details and photographs, then publish it when ready.':'Create a listing and prepare it at your own pace.'}</p><Link className={styles.primary} href={status==='published'?'/dealer/cars?status=draft':'/dealer/cars/new'}>{status==='published'?'View drafts':'Add a vehicle'}</Link></section>}
 </div></main>;
}
