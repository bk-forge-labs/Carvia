import Link from 'next/link';
import GuidedDiscovery from '@/components/cars/GuidedDiscovery';
import BrowsePosition from '@/components/cars/BrowsePosition';
import CarCard from '@/components/cars/CarCard';
import ResultsFilterPanel from '@/components/cars/ResultsFilterPanel';
import VehicleFilters from '@/components/cars/VehicleFilters';
import { getBrandsServer, getCarsServer } from '@/lib/api/car';
import { HomeFooter } from '@/components/home/HomeClosing';
import styles from './results.module.css';
type Params = { page?: string; brand?: string; bodyStyle?: string; minPrice?: string; maxPrice?: string; minYear?: string; maxYear?: string; sort?: string; model?:string; fuelType?:string; transmission?:string; exteriorColor?:string; seats?:string; doors?:string; minMileage?:string; maxMileage?:string };
export default async function CarsPage({ searchParams }: { searchParams?: Promise<Params> }) {
  const raw = (await searchParams) ?? {};
  const allowed=['brand','model','bodyStyle','minPrice','maxPrice','minYear','maxYear','minMileage','maxMileage','transmission','fuelType','exteriorColor','seats','doors','sort','page'];
  const params:Params=Object.fromEntries(Object.entries(raw).filter(([k,v])=>allowed.includes(k)&&typeof v==='string'));
  const parsedPage = Number(params.page);
  const page = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const [response, brandsResponse] = await Promise.all([getCarsServer({ ...params, page }), getBrandsServer()]);
  const { data: cars, pagination } = response;
  const brands = Array.from(new Set([...brandsResponse.data, ...(params.brand ? [params.brand] : [])])).sort();
  const contextQuery = new URLSearchParams();
  Object.entries(params).forEach(([key,value])=>{if(typeof value==='string' && value)contextQuery.set(key,value);});
  const hasFilters = Object.entries(params).some(([k,v])=>v&&k!=='sort'&&k!=='page');
  const pageHref = (next: number) => { const query = new URLSearchParams(); Object.entries(params).forEach(([key,value]) => { if (value && key !== 'page') query.set(key,value); }); query.set('page',String(next)); return `/cars?${query}`; };
  return <><main id='carvia-home' className={styles.page}><div className={styles.inner}>
    <nav className={styles.breadcrumb} aria-label='Breadcrumb'><Link href='/'>Veltrenne</Link><span aria-hidden='true'>/</span><span>Explore cars</span></nav>
    <header className={styles.heading}><p className={styles.eyebrow}>The Veltrenne collection</p><h1>{params.brand ? `Explore ${params.brand}.` : 'Find your next chapter.'}</h1><p>Consider the details. Discover the car that fits your life.</p></header>
    <BrowsePosition query={contextQuery.toString()}/><Link href='/buyer/favorites'>Open your shortlist ↗</Link><GuidedDiscovery key={contextQuery.toString()} initial={Object.fromEntries(Object.entries(params).filter((entry):entry is [string,string]=>typeof entry[1]==='string'))}/>
    <ResultsFilterPanel active={Object.entries(params).filter(([k,v])=>v&&k!=='sort'&&k!=='page').length}><VehicleFilters key={contextQuery.toString()} initial={Object.fromEntries(Object.entries(params).filter(([k])=>k!=='page'))} brands={brands}/></ResultsFilterPanel>
    <div className={styles.summary}><p><strong>{pagination.totalCars.toLocaleString('en-GB')}</strong> {pagination.totalCars === 1 ? 'vehicle listing' : 'vehicle listings'}{hasFilters ? ' matching your search' : ''}</p>{hasFilters && <Link href='/cars'>Clear filters ×</Link>}</div>
    {cars.length ? <section className={styles.grid} aria-label='Available cars'>{cars.map(car => <CarCard key={car._id} car={car} searchQuery={contextQuery.toString()} />)}</section> : <section className={styles.empty}><p className={styles.eyebrow}>Room for a new possibility</p><h2>{pagination.totalCars > 0 ? 'You’ve reached the end of these results.' : hasFilters ? 'A different search. A new possibility.' : 'The collection is taking shape.'}</h2><p>{pagination.totalCars > 0 ? 'Return to the first page to explore matching cars.' : hasFilters ? 'No cars match these filters right now. Try another make or widen your budget.' : 'There are no vehicle listings right now. New listings will appear here when they are ready.'}</p><Link href={pagination.totalCars > 0 ? pageHref(1) : hasFilters ? '/cars' : '/'}>{pagination.totalCars > 0 ? 'Back to first page' : hasFilters ? 'Explore all cars' : 'Back to Veltrenne'} <span aria-hidden='true'>↗</span></Link></section>}
    {pagination.totalPages > 1 && <nav className={styles.pagination} aria-label='Results pages'>{page > 1 ? <Link href={pageHref(page - 1)}>← Previous</Link> : <span />}<span>Page {page} of {pagination.totalPages}</span>{page < pagination.totalPages ? <Link href={pageHref(page + 1)}>Next →</Link> : <span />}</nav>}
  </div></main><HomeFooter /></>;
}
