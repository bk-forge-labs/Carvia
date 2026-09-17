import TurntableScene from './TurntableScene';
import Link from 'next/link';
import styles from './ShowroomHero.module.css';

const makes = ['Audi', 'BMW', 'Mercedes-Benz', 'Porsche', 'Tesla', 'Volkswagen'];
const bodyStyles = ['SUV', 'Sedan', 'Coupe', 'Convertible', 'Hatchback', 'Estate', 'Van'];

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <svg width='20' height='20' viewBox='0 0 24 24' fill='none' aria-hidden='true'><path d={diagonal ? 'M5 19 19 5M5 5h14v14' : 'M4 12h15m-6-6 6 6-6 6'} stroke='currentColor' strokeWidth='1.4' /></svg>;
}

export default function ShowroomHero() {
  return (
    <section className={styles.hero} aria-labelledby='showroom-title'>
      <div className={styles.scene}>
        <TurntableScene className={styles.image} />
      </div>
      <div className={styles.shade} />
      <div className={styles.copy}>
        <p className={styles.eyebrow}>The Carvia Collection</p>
        <h1 id='showroom-title'>Exceptional cars.<br />Your next chapter.</h1>
        <p className={styles.description}>Discover remarkable vehicles. Find the one that moves you.</p>
        <div className={styles.ctas}>
          <Link href='/cars' className={styles.primary}>Explore vehicles</Link>
          <Link href='/#for-dealers' className={styles.secondary}>Become a dealer <Arrow diagonal /></Link>
        </div>
      </div>
      <form action='/cars' method='get' className={styles.search} aria-label='Find your car'>
        <label className={styles.field}>
          <span>Make</span>
          <select aria-label='Make' name='brand' defaultValue=''><option value=''>All makes</option>{makes.map(make => <option key={make} value={make}>{make}</option>)}</select>
        </label>
        <label className={styles.field}>
          <span>Body style</span>
          <select aria-label='Body style' name='bodyStyle' defaultValue=''><option value=''>All styles</option>{bodyStyles.map(style => <option key={style} value={style}>{style}</option>)}</select>
        </label>
        <label className={styles.field}>
          <span>Budget</span>
          <select aria-label='Budget' name='maxPrice' defaultValue=''><option value=''>Any price</option><option value='25000'>Up to €25,000</option><option value='50000'>Up to €50,000</option><option value='75000'>Up to €75,000</option><option value='100000'>Up to €100,000</option><option value='150000'>Up to €150,000</option></select>
        </label>
        <button type='submit' className={styles.find}>Find your car <Arrow /></button>
      </form>
    </section>
  );
}
