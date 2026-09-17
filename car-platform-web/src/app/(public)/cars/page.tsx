import Link from 'next/link';
import CarCard from '@/components/cars/CarCard';
import ResultsFilterPanel from '@/components/cars/ResultsFilterPanel';
import { getBrandsServer, getCarsServer } from '@/lib/api/car';
import { HomeFooter } from '@/components/home/HomeClosing';
import styles from './results.module.css';
type Params = { page?: string; brand?: string; bodyStyle?: string; minPrice?: string; maxPrice?: string; minYear?: string; maxYear?: string; sort?: string };
export default async function CarsPage({ searchParams }: { searchParams?: Promise<Params> }) {
  const params = (await searchParams) ?? {};
  const parsedPage = Number(params.page);
  const page = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const [response, brandsResponse] = await Promise.all([getCarsServer({ ...params, page }), getBrandsServer()]);
  const { data: cars, pagination } = response;
  const brands = Array.from(new Set([...brandsResponse.data, ...(params.brand ? [params.brand] : [])])).sort();
  const contextQuery = new URLSearchParams();
  Object.entries(params).forEach(([key,value])=>{if(typeof value==='string' && value)contextQuery.set(key,value);});
  const hasFilters = Boolean(params.brand || params.bodyStyle || params.minPrice || params.maxPrice || params.minYear || params.maxYear);
  const pageHref = (next: number) => { const query = new URLSearchParams(); Object.entries(params).forEach(([key,value]) => { if (value && key !== 'page') query.set(key,value); }); query.set('page',String(next)); return `/cars?${query}`; };
  return <><main id='carvia-home' className={styles.page}><div className={styles.inner}>
    <nav className={styles.breadcrumb} aria-label='Breadcrumb'><Link href='/'>Carvia</Link><span aria-hidden='true'>/</span><span>Explore cars</span></nav>
    <header className={styles.heading}><p className={styles.eyebrow}>The Carvia collection</p><h1>{params.brand ? `Explore ${params.brand}.` : 'Find your next chapter.'}</h1><p>Consider the details. Discover the car that fits your life.</p></header>
    <ResultsFilterPanel active={[params.brand,params.bodyStyle,params.minPrice,params.maxPrice,params.minYear,params.maxYear].filter(Boolean).length}><form action='/cars' className={styles.filters} aria-label='Filter cars'>
      <label>Make<select aria-label='Make' name='brand' defaultValue={params.brand || ''}><option value=''>All makes</option>{brands.map(brand => <option key={brand}>{brand}</option>)}</select></label>
      <label>Body style<select aria-label='Body style' name='bodyStyle' defaultValue={params.bodyStyle || ''}><option value=''>All styles</option>{['SUV','Sedan','Coupe','Convertible','Hatchback','Estate','Van'].map(style => <option key={style}>{style}</option>)}</select></label>
      <label>Minimum price<input name='minPrice' type='number' min='0' step='1' placeholder='No minimum' defaultValue={params.minPrice || ''} /></label>
      <label>Maximum price<input name='maxPrice' type='number' min='0' step='1' placeholder='No maximum' defaultValue={params.maxPrice || ''} /></label>
      <label>Sort by<select aria-label='Sort by' name='sort' defaultValue={params.sort || 'newest'}><option value='newest'>Newest arrivals</option><option value='price_asc'>Price: low to high</option><option value='price_desc'>Price: high to low</option><option value='year_desc'>Newest year</option></select></label>
      {params.minYear && <input type='hidden' name='minYear' value={params.minYear} />}{params.maxYear && <input type='hidden' name='maxYear' value={params.maxYear} />}
      <button type='submit'>Show results <span aria-hidden='true'>↗</span></button>
    </form></ResultsFilterPanel>
    <div className={styles.summary}><p><strong>{pagination.totalCars.toLocaleString('en-GB')}</strong> {pagination.totalCars === 1 ? 'car' : 'cars'}{hasFilters ? ' matching your search' : ' available'}</p>{hasFilters && <Link href='/cars'>Clear filters ×</Link>}</div>
    {cars.length ? <section className={styles.grid} aria-label='Available cars'>{cars.map(car => <CarCard key={car._id} car={car} searchQuery={contextQuery.toString()} />)}</section> : <section className={styles.empty}><p className={styles.eyebrow}>Room for a new possibility</p><h2>{pagination.totalCars > 0 ? 'You’ve reached the end of these results.' : hasFilters ? 'A different search. A new possibility.' : 'The collection is taking shape.'}</h2><p>{pagination.totalCars > 0 ? 'Return to the first page to explore matching cars.' : hasFilters ? 'No cars match these filters right now. Try another make or widen your budget.' : 'There are no cars available right now. New listings will appear here when they are ready.'}</p><Link href={pagination.totalCars > 0 ? pageHref(1) : hasFilters ? '/cars' : '/'}>{pagination.totalCars > 0 ? 'Back to first page' : hasFilters ? 'Explore all cars' : 'Back to Carvia'} <span aria-hidden='true'>↗</span></Link></section>}
    {pagination.totalPages > 1 && <nav className={styles.pagination} aria-label='Results pages'>{page > 1 ? <Link href={pageHref(page - 1)}>← Previous</Link> : <span />}<span>Page {page} of {pagination.totalPages}</span>{page < pagination.totalPages ? <Link href={pageHref(page + 1)}>Next →</Link> : <span />}</nav>}
  </div></main><HomeFooter /></>;
}
