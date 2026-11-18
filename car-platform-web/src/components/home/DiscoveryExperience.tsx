'use client';
import VehicleFilters from '@/components/cars/VehicleFilters';

import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import Image from 'next/image';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import RecentlyViewed from './RecentlyViewed';
import LatestArrivals from './LatestArrivals';
import CvShowroom from './CvShowroom';
import TurntableScene from './TurntableScene';
import { api } from '@/lib/api/browser';
import { endpoints } from '@/lib/api/endpoints';
import styles from './DiscoveryExperience.module.css';

type Vehicle = 'cars' | 'motorcycles';
type Deal = 'buy' | 'lease';
type Filters = { brand: string; style: string; budget: string; term: string; mileage: string };
const empty = (): Filters => ({ brand: '', style: '', budget: '', term: '36', mileage: '10000' });
const makes = { cars: ['Audi', 'BMW', 'Mercedes-Benz', 'Porsche', 'Tesla', 'Volkswagen'], motorcycles: ['BMW Motorrad', 'Ducati', 'Honda', 'Kawasaki', 'Triumph', 'Yamaha'] };
const categories = {
  cars: [{ label: 'SUVs', value: 'SUV', detail: 'Room for every possibility' }, { label: 'Sedans', value: 'Sedan', detail: 'Comfort with presence' }, { label: 'Estates', value: 'Estate', detail: 'Space without compromise' }, { label: 'Convertibles', value: 'Convertible', detail: 'Open up the everyday' }],
  motorcycles: [{ label: 'Roadsters', value: 'Roadster', detail: 'The road, distilled' }, { label: 'Adventure', value: 'Adventure', detail: 'Beyond the familiar' }, { label: 'Sport', value: 'Sport', detail: 'Precision in every curve' }, { label: 'Scooters', value: 'Scooter', detail: 'Make the city yours' }],
};
const budgets = { cars: ['25000', '50000', '75000', '100000', '150000'], motorcycles: ['5000', '10000', '15000', '20000', '30000'], lease: ['150', '250', '400', '600', '1000'] };
const euro = (value: string) => `€${Number(value).toLocaleString('en-GB')}`;
function Arrow() { return <span aria-hidden='true'>↗</span>; }

export default function DiscoveryExperience() {
  const router=useRouter();
  const [carMakes,setCarMakes]=useState<string[]>([]);
  useEffect(()=>{const controller=new AbortController();api<{data:string[]}>(endpoints.cars.brands,{signal:controller.signal}).then(r=>setCarMakes(r.data)).catch(()=>{});return()=>controller.abort();},[]);
  const [showBrand, setShowBrand] = useState(true);
  const [vehicle, setVehicle] = useState<Vehicle>('cars');
  const [deal, setDeal] = useState<Deal>('buy');
  const [saved, setSaved] = useState<Record<string, Filters>>({ 'cars:buy': empty(), 'cars:lease': empty(), 'motorcycles:buy': empty(), 'motorcycles:lease': empty() });
  const [result, setResult] = useState<{ key: string; total: number | null }>({ key: '', total: null });
  const [revealed, setRevealed] = useState(false);
  const categoryRef = useRef<HTMLElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const key = `${vehicle}:${deal}`;
  const filters = saved[key];
  const live = vehicle === 'cars' && deal === 'buy';
  const query = new URLSearchParams();
  if (filters.brand) query.set('brand', filters.brand);
  if (filters.style) query.set('bodyStyle', filters.style);
  if (filters.budget) query.set('maxPrice', filters.budget);
  const queryString = query.toString();
  const requestKey = `${key}:${queryString}`;
  const pending = live && result.key !== requestKey;
  const total = result.key === requestKey ? result.total : null;
  const update = (name: keyof Filters, value: string) => setSaved(previous => ({ ...previous, [key]: { ...previous[key], [name]: value } }));

  useEffect(() => {
    if (!live) return;
    let active = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const debounce = setTimeout(async () => {
      try {
        const response = await api<{ success: boolean; pagination?: { totalCars?: number } }>(`/cars?${queryString}`, { signal: controller.signal });
        const count = response.success && response.pagination?.totalCars;
        if (active) setResult({ key: requestKey, total: typeof count === 'number' && Number.isFinite(count) ? count : null });
      } catch { if (active) setResult({ key: requestKey, total: null }); }
      finally { clearTimeout(timeout); }
    }, 300);
    return () => { active = false; clearTimeout(debounce); clearTimeout(timeout); controller.abort(); };
  }, [live, queryString, requestKey]);

  useEffect(() => {
    const element = categoryRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setRevealed(true); observer.disconnect(); }
    }, { threshold: .1 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (live) router.push(`/cars${queryString ? `?${queryString}` : ''}`);
    else dialogRef.current?.showModal();
  }

  return (
    <div className={styles.experience}>
      <section className={styles.hero} aria-labelledby='discovery-title'>
        <div className={styles.scene}>
          {showBrand ? <div key='brand' className={styles.sceneEnter}><CvShowroom className={styles.heroImage} /></div> : vehicle === 'cars' ? <div key='car' className={styles.sceneEnter}><TurntableScene className={styles.heroImage} /></div> : <div key='motorcycle' className={styles.sceneEnter}><Image src='/brand/discovery/motorcycle-showroom.webp' alt='' fill priority sizes='100vw' className={styles.heroImage} /></div>}
        </div>
        <div className={styles.shade} />
        <div className={styles.copy} key={showBrand ? 'brand' : vehicle}>
          <p className={styles.eyebrow}>The Veltrenne Collection · {showBrand ? 'A new perspective' : vehicle === 'cars' ? 'Four wheels' : 'Two wheels'}</p>
          <h1 id='discovery-title'>{showBrand ? 'Your next chapter.' : vehicle === 'cars' ? 'Exceptional cars.' : 'Pure freedom.'}<br />{showBrand ? 'Starts with Veltrenne.' : vehicle === 'cars' ? 'Your next chapter.' : 'Your next ride.'}</h1>
          <p className={styles.description}>{vehicle === 'cars' ? 'Discover remarkable vehicles. Find the one that moves you.' : 'Extraordinary motorcycles. For the roads that call you.'}</p>
          <div className={styles.heroActions}><a href='#discovery-search' className={styles.heroLink}>Find your {showBrand ? 'next vehicle' : vehicle === 'cars' ? 'next car' : 'next motorcycle'} <Arrow /></a><Link href='/cars#help-me-choose' className={styles.heroSecondary}>Help me choose</Link></div>
        </div>
        <span className={styles.sceneCaption}>{showBrand ? 'VE / The Veltrenne Collection' : vehicle === 'cars' ? '01 / The drive' : '02 / The ride'}</span>
      </section>

      <div className={styles.discovery}>
        <form id='discovery-search' onSubmit={submit} className={styles.search} aria-label='Discover vehicles'>
          <div className={styles.searchTop}>
            <div className={styles.vehicleSwitch} role='group' aria-label='Vehicle type'>
              {(['cars'] as const).map(type => <button key={type} type='button' aria-pressed={!showBrand && vehicle === type} onClick={() => { setVehicle(type); setShowBrand(false); }}>Cars</button>)}
            </div>
            <div className={styles.dealSwitch} role='group' aria-label='Purchase method'>
              {(['buy'] as const).map(type => <button key={type} type='button' aria-pressed={deal === type} onClick={() => setDeal(type)}>Buy</button>)}
            </div>
          </div>
          <div className={styles.fields}>
            <label><span>Make</span><select aria-label='Make' value={filters.brand} onChange={e => update('brand', e.target.value)}><option value=''>All makes</option>{(vehicle==='cars'?carMakes:makes.motorcycles).map(make => <option key={make}>{make}</option>)}</select></label>
            <label><span>{vehicle === 'cars' ? 'Body style' : 'Riding style'}</span><select aria-label={vehicle === 'cars' ? 'Body style' : 'Riding style'} value={filters.style} onChange={e => update('style', e.target.value)}><option value=''>All styles</option>{categories[vehicle].map(category => <option key={category.value} value={category.value}>{category.label}</option>)}{vehicle === 'cars' && <><option value='Coupe'>Coupes</option><option value='Hatchback'>Hatchbacks</option><option value='Van'>Vans</option></>}</select></label>
            <label><span>{deal === 'lease' ? 'Monthly budget' : 'Purchase budget'}</span><select aria-label={deal === 'lease' ? 'Monthly budget' : 'Purchase budget'} value={filters.budget} onChange={e => update('budget', e.target.value)}><option value=''>{deal === 'lease' ? 'Any monthly payment' : 'Any price'}</option>{budgets[deal === 'lease' ? 'lease' : vehicle].map(value => <option key={value} value={value}>Up to {euro(value)}{deal === 'lease' ? ' / mo' : ''}</option>)}</select></label>
            <button className={styles.find} type='submit'><span aria-live='polite'>{pending ? 'Updating…' : !live ? 'Review your search' : total !== null ? `Explore ${total.toLocaleString('en-GB')} vehicles` : 'Explore cars'}</span><Arrow /></button>
          </div>
          {deal === 'lease' && <div className={styles.leaseFields}>
            <label><span>Lease term</span><select aria-label='Lease term' value={filters.term} onChange={e => update('term', e.target.value)}>{['24', '36', '48'].map(value => <option key={value} value={value}>{value} months</option>)}</select></label>
            <label><span>Annual mileage</span><select aria-label='Annual mileage' value={filters.mileage} onChange={e => update('mileage', e.target.value)}>{['5000', '10000', '15000', '20000'].map(value => <option key={value} value={value}>{Number(value).toLocaleString('en-GB')} km / year</option>)}</select></label>
            <p>A new way to drive.<br /><span>Choose a payment that fits your life.</span></p>
          </div>}
          <div className={styles.searchFoot}><span>{live ? 'Your next chapter starts here.' : 'Live offers not yet available'}</span><button type='button' onClick={() => setSaved(previous => ({ ...previous, [key]: empty() }))}>Reset filters</button></div>
        </form>
        {live&&<VehicleFilters key={queryString} compact initial={{brand:filters.brand,bodyStyle:filters.style,maxPrice:filters.budget}} brands={carMakes}/>}

        <section ref={categoryRef} className={`${styles.categories} ${revealed ? styles.revealed : ''}`} aria-labelledby='body-style-title'>
          {showBrand ? <RecentlyViewed /> : <>
          <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>{vehicle === 'cars' ? 'A shape for every chapter' : 'A ride for every road'}</p><h2 id='body-style-title'>{vehicle === 'cars' ? 'Find your kind of drive.' : 'Follow your kind of freedom.'}</h2></div><span>Select a style to refine your search <span aria-hidden='true'>↓</span></span></div>
          <div className={styles.categoryGrid} key={vehicle}>
            {categories[vehicle].map((category, index) => <button type='button' key={category.value} className={styles.category} aria-pressed={filters.style === category.value} onClick={() => { setShowBrand(false); update('style', filters.style === category.value ? '' : category.value); }} style={{ '--delay': `${index * 75}ms` } as CSSProperties}>
              <div className={styles.categoryImage} style={{ backgroundPosition: `${index * 100 / 3}% ${vehicle === 'cars' ? '0' : '90'}%` }} />
              <div className={styles.categoryLabel}><span>{category.label}</span><span aria-hidden='true'>{filters.style === category.value ? '✓' : '↗'}</span></div><p>{category.detail}</p>
            </button>)}
          </div>
          <div className={styles.selection} aria-live='polite'>{filters.style ? <><span>{categories[vehicle].find(category => category.value === filters.style)?.label || filters.style} selected</span><a href='#discovery-search'>Review your search ↑</a></> : <span>Considered choices. Remarkable journeys.</span>}</div>
          {vehicle === 'cars' && deal === 'buy' && <div className={styles.brands} aria-labelledby='premium-brands-title'>
            <h3 id='premium-brands-title'>Premium brands</h3>
            <ul>{[['BMW', 'bmw'], ['Mercedes-Benz', 'mercedes-benz'], ['Audi', 'audi'], ['Porsche', 'porsche'], ['Tesla', 'tesla'], ['Volkswagen', 'volkswagen']].map(([brand, slug]) => <li key={slug}>
              <Link href={`/cars?brand=${encodeURIComponent(brand)}`} className={styles.brandLink} aria-label={`Explore ${brand} vehicles`}
                onPointerMove={event => {
                  if (event.pointerType !== 'mouse' || !window.matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches) return;
                  const bounds = event.currentTarget.getBoundingClientRect();
                  event.currentTarget.style.setProperty('--brand-x', `${-(event.clientY - bounds.top - bounds.height / 2) / bounds.height * 14}deg`);
                  event.currentTarget.style.setProperty('--brand-y', `${(event.clientX - bounds.left - bounds.width / 2) / bounds.width * 20}deg`);
                }}
                onPointerLeave={event => { event.currentTarget.style.removeProperty('--brand-x'); event.currentTarget.style.removeProperty('--brand-y'); }}
                onBlur={event => { event.currentTarget.style.removeProperty('--brand-x'); event.currentTarget.style.removeProperty('--brand-y'); }}>
              <span className={styles.brandLogo} data-brand={slug} aria-hidden='true'><Image src={`/brand/manufacturers/${slug}.png`} alt='' width={slug === 'mercedes-benz' ? 1920 : slug === 'volkswagen' ? 1500 : 640} height={slug === 'mercedes-benz' ? 1080 : slug === 'volkswagen' ? 1500 : 426} sizes='240px' /></span>
              <span className={styles.brandName}>{brand}</span>
              </Link>
            </li>)}</ul>
          </div>}
          </>}
        </section>
      </div>
      <LatestArrivals vehicle={vehicle} deal={deal} onBrowseCars={() => { setVehicle('cars'); setDeal('buy'); setShowBrand(false); }} />
      <dialog ref={dialogRef} className={styles.dialog}>
        <form method='dialog'><button className={styles.close} aria-label='Close search preview'>×</button></form>
        <p className={styles.eyebrow}>Your search</p><h2>{deal === 'lease' ? 'A new chapter, on your terms.' : 'Your next ride starts here.'}</h2>
        <p>{deal === 'lease' ? 'Leasing offers' : 'Motorcycle listings'} are not available yet. Your selections are kept while you explore.</p>
        <dl><div><dt>Vehicle</dt><dd>{vehicle === 'cars' ? 'Cars' : 'Motorcycles'} · {deal === 'buy' ? 'Buy' : 'Lease'}</dd></div><div><dt>Make & style</dt><dd>{filters.brand || 'All makes'} · {filters.style || 'All styles'}</dd></div><div><dt>Budget</dt><dd>{filters.budget ? `Up to ${euro(filters.budget)}${deal === 'lease' ? ' / month' : ''}` : 'Any budget'}</dd></div>{deal === 'lease' && <div><dt>Lease</dt><dd>{filters.term} months · {Number(filters.mileage).toLocaleString('en-GB')} km / year</dd></div>}</dl>
        <form method='dialog'><button className={styles.find}>Continue exploring <Arrow /></button></form><Link href='/cars' className={styles.existing}>Browse available cars</Link>
      </dialog>
    </div>
  );
}
