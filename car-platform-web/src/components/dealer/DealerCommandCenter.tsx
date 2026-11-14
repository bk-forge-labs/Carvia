import Link from 'next/link';
import type {DealerDashboardStats} from '@/lib/api/dealerDashboard.server';
import DealerEnquiryOverview from './DealerEnquiryOverview';
import styles from './DealerCommandCenter.module.css';

const number = (value: number) => value.toLocaleString('en-GB');
const money = (value: number) => new Intl.NumberFormat('en-IE', {style:'currency',currency:'EUR',maximumFractionDigits:0}).format(value);

export default function DealerCommandCenter({stats, companyName}:{stats:DealerDashboardStats;companyName:string}) {
  const publishedShare = stats.totalCars ? Math.min(100, stats.publishedCars / stats.totalCars * 100) : 0;
  const cards = [
    {label:'Total inventory',value:stats.totalCars,note:'Vehicles in your workspace',href:'/dealer/cars'},
    {label:'Published listings',value:stats.publishedCars,note:'Currently marked as published',href:'/dealer/cars?status=published'},
    {label:'Draft listings',value:stats.draftCars,note:'Not yet published',href:'/dealer/cars?status=draft'},
  ];
  return <main className={styles.page}><div className={styles.inner}>
    <header className={styles.heading}>
      <div><p className={styles.eyebrow}>{companyName} <span aria-hidden='true'>/</span> Dealer workspace</p><h1>Your showroom, at a glance.</h1><p className={styles.intro}>Stay close to your buyers. Keep your inventory moving.</p></div>
      <Link href='/dealer/cars/new' className={styles.primary}><span aria-hidden='true'>＋</span> Add a vehicle</Link>
    </header>
    <section className={styles.stats} aria-label='Inventory summary'>
      {cards.map((card,index)=><Link key={card.label} href={card.href} className={styles.stat}>
        <div className={styles.statTop}><h2><span className={styles.dot} data-kind={index} aria-hidden='true'/>{card.label}</h2><span aria-hidden='true'>↗</span></div>
        <p className={styles.number}>{number(card.value)}</p><p className={styles.description}>{card.note}</p>
      </Link>)}
    </section>
    <div className={styles.mainGrid}>
      <DealerEnquiryOverview/>
      <section className={styles.panel} aria-labelledby='inventory-health'>
        <div className={styles.panelHeading}><div><p className={styles.eyebrow}>Your collection</p><h2 id='inventory-health'>Publication overview</h2></div><span className={styles.smallMark} aria-hidden='true'>◈</span></div>
        <p className={styles.overviewNumber}>{number(stats.publishedCars)}<span> / {number(stats.totalCars)} published</span></p>
        <div className={styles.bar} aria-hidden='true'><span style={{width:`${publishedShare}%`}}/></div>
        <div className={styles.legend}><span><i aria-hidden='true'/>Published <strong>{number(stats.publishedCars)}</strong></span><span><i aria-hidden='true'/>Drafts <strong>{number(stats.draftCars)}</strong></span></div>
        <div className={styles.nextAction}><p className={styles.eyebrow}>Your next step</p><h3>{stats.draftCars?'Give your drafts a final look.':stats.totalCars?'Keep your collection current.':'Make your first impression.'}</h3><p>{stats.draftCars?'Check the details, photographs and publication requirements before bringing a vehicle to market.':stats.totalCars?'Review your vehicle details and availability so buyers know what to expect.':'Add a vehicle, upload its photographs, and review the listing before you publish.'}</p>
          <Link className={styles.secondary} href={stats.draftCars?'/dealer/cars?status=draft':stats.totalCars?'/dealer/cars':'/dealer/cars/new'}>{stats.draftCars?'Review drafts':stats.totalCars?'Manage inventory':'Add your first vehicle'} <span aria-hidden='true'>→</span></Link>
        </div>
      </section>
    </div>
    <section className={`${styles.panel} ${styles.recent}`} aria-labelledby='recent-inventory'>
      <div className={styles.panelHeading}><div><p className={styles.eyebrow}>Latest additions</p><h2 id='recent-inventory'>Recent inventory</h2></div><Link className={styles.textLink} href='/dealer/cars'>View all inventory <span aria-hidden='true'>↗</span></Link></div>
      {stats.latestCars.length?<ul className={styles.vehicleList}>{stats.latestCars.map(car=><li key={car._id}><Link href={`/dealer/cars/${car._id}`} className={styles.vehicleRow}><span className={styles.vehicleMonogram} aria-hidden='true'>{car.brand?.slice(0,2).toUpperCase()||'VE'}</span><span className={styles.vehicleTitle}><strong>{car.title}</strong><span>{car.year} <span aria-hidden='true'>·</span> {number(car.mileage)} km</span></span><span className={styles.price}>{money(car.price)}</span><span className={styles.rowAction}>View vehicle <span aria-hidden='true'>↗</span></span></Link></li>)}</ul>:<div className={styles.empty}><h3>A considered collection starts with one vehicle.</h3><p>Your newest listings will appear here as you add them.</p><Link href='/dealer/cars/new' className={styles.textLink}>Create a listing →</Link></div>}
    </section>
    <footer className={styles.footer}><p>VELTRENNE <span>Dealer workspace</span></p><div><Link href='/account'>Manage account</Link><Link href='/cars'>Explore marketplace ↗</Link></div></footer>
  </div></main>;
}
