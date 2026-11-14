import Image from 'next/image';
import Link from 'next/link';
import styles from './HomeClosing.module.css';

export default function HomeClosing() {
  return <section className={styles.closing} aria-labelledby='closing-title'>
    <div className={styles.invitation}>
      <span className={styles.line} aria-hidden='true' />
      <p className={styles.eyebrow}>The Veltrenne collection</p>
      <h2 id='closing-title'>Your next chapter<br /><span>starts here.</span></h2>
      <p className={styles.description}>Find a vehicle that fits the life you want to lead.</p>
      <Link className={styles.explore} href='/cars'>Explore vehicles <span aria-hidden='true'>↗</span></Link>
    </div>
  </section>;
}

export function HomeFooter() {
  return <footer className={styles.footer}>
    <div className={styles.inner}>
      <div className={styles.top}>
        <div className={styles.brand}><Link href='/' aria-label='Veltrenne home'><Image src='/logo/veltrenne/horizontal-gold.svg' alt='' width={628} height={75} sizes='210px' className={styles.logo} /></Link><p>A considered way to find<br />your next vehicle.</p></div>
        <nav className={styles.navigation} aria-label='Footer navigation'>
          <div><h2>Discover</h2><Link href='/cars'>Explore vehicles</Link><Link href='/photo-credits'>Photo credits</Link><Link href='/#our-approach'>How Veltrenne works</Link></div>
          <div><h2>For dealers</h2><Link href='/#for-dealers'>Veltrenne for dealers</Link><Link href='/register?role=dealer'>Join as a dealer</Link></div>
          <div><h2>Your Veltrenne</h2><Link href='/login'>Sign in</Link><Link href='/register'>Create an account</Link><Link href='/contact'>Contact &amp; help</Link><Link href='/privacy'>Privacy</Link><Link href='/terms'>Terms of use</Link><Link href='/legal'>Legal notice</Link></div>
        </nav>
      </div>
      <div className={styles.bottom}><p>© {new Date().getFullYear()} Veltrenne</p><a href='#'>Back to top <span aria-hidden='true'>↑</span></a></div>
    </div>
  </footer>;
}
