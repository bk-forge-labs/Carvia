import Link from 'next/link';
import { HomeFooter } from '@/components/home/HomeClosing';
import styles from './results.module.css';
export default function VehicleUnavailable() { return <><main id='carvia-home' className={styles.page}><div className={styles.inner}><header className={styles.heading}><p className={styles.eyebrow}>The Carvia collection</p><h1>This vehicle is no longer available.</h1><p>The listing may have been withdrawn or is being updated. Explore the current collection for your next chapter.</p></header><div className={styles.empty}><h2>There’s another road ahead.</h2><Link href='/cars'>Explore available cars <span aria-hidden='true'>↗</span></Link></div></div></main><HomeFooter /></>; }
