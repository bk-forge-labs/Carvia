import Link from 'next/link';
import DealerCarCard from '@/components/dealer/DealerCarCard';
import {getDealerCarsServer} from '@/lib/api/dealerCars.server';
import type {Car} from '@/types/car';
import styles from '@/components/dealer/DealerWorkspace.module.css';
import overview from '@/components/dealer/DealerCommandCenter.module.css';
export default async function DealerCarsPage({searchParams}:{searchParams:Promise<{status?:string;q?:string}>}) {
 const [res,query]=await Promise.all([getDealerCarsServer(),searchParams]);
 const cars:Car[]=res.data ?? [];
 const status=['published','draft'].includes(query.status || '')?query.status:'all';
 const published=cars.filter(car=>car.isPublished).length;
 const term=typeof query.q==='string'?query.q.trim().slice(0,120):'';
 const shown=cars.filter(car=>(status==='all'||(status==='published'?car.isPublished:!car.isPublished))&&(!term||[car.title,car.brand,car.model].filter(Boolean).join(' ').toLowerCase().includes(term.toLowerCase())));
 return <main className={`${styles.page} ${styles.inventoryPage}`}><div className={styles.inner}><header className={overview.heading}><div><p className={overview.eyebrow}>Dealer workspace / Inventory</p><h1>Your collection, in focus.</h1><p className={overview.intro}>Prepare, publish and keep every vehicle looking its best.</p></div><Link href='/dealer/cars/new' className={overview.primary}><span aria-hidden='true'>＋</span> Add a vehicle</Link></header>
 <section className={overview.stats} aria-label='Inventory summary'>{[['Total inventory',cars.length,'All your vehicles'],['Published listings',published,'Marked as published'],['Draft listings',cars.length-published,'Not yet published']].map(([label,value,note],index)=><div key={label} className={overview.stat}><div className={overview.statTop}><h2><span className={overview.dot} data-kind={index} aria-hidden='true'/>{label}</h2></div><p className={overview.number}>{value.toLocaleString('en-GB')}</p><p className={overview.description}>{note}</p></div>)}</section>
 <div className={styles.inventoryToolbar}><form key={`${status}-${term}`} action='/dealer/cars' className={styles.inventorySearch}><input type='hidden' name='status' value={status}/><label htmlFor='inventory-search'>Find a vehicle</label><div><input id='inventory-search' name='q' type='search' maxLength={120} defaultValue={term} placeholder='Search make, model or listing name'/><button type='submit'>Search</button></div></form><p>{shown.length.toLocaleString('en-GB')} {shown.length===1?'vehicle':'vehicles'}{term?' matching your search':' in this view'}{term&&<Link href={status==='all'?'/dealer/cars':`/dealer/cars?status=${status}`}>Clear search</Link>}</p></div>
 <nav className={styles.tabs} aria-label='Inventory status'>{[['all','All vehicles',cars.length],['published','Published',published],['draft','Drafts',cars.length-published]].map(([value,label,count])=><Link key={value} href={`/dealer/cars?${new URLSearchParams({...((value!=='all')?{status:String(value)}:{}),...(term?{q:term}:{})})}`} aria-current={status===value?'page':undefined}>{label}<span>{count}</span></Link>)}</nav>
 {shown.length?<section className={styles.grid} aria-label='Your vehicles'>{shown.map(car=><DealerCarCard key={car._id} car={car}/>)}</section>:<section className={`${styles.panel} ${styles.empty}`}><h2>{term?'No matching vehicles.':status==='all'?'Your collection starts here.':status==='draft'?'No drafts waiting.':'No vehicles published yet.'}</h2><p>{term?'Try another make, model or listing name.':status==='published'?'Open a draft, complete its details and photographs, then publish it when ready.':'Create a listing and prepare it at your own pace.'}</p><Link className={styles.primary} href={term?(status==='all'?'/dealer/cars':`/dealer/cars?status=${status}`):status==='published'?'/dealer/cars?status=draft':'/dealer/cars/new'}>{term?'Clear search':status==='published'?'View drafts':'Add a vehicle'}</Link></section>}
 </div></main>;
}
