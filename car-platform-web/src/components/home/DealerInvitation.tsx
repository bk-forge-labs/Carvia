import Image from 'next/image';
import Link from 'next/link';
import styles from './DealerInvitation.module.css';

export default function DealerInvitation() {
  return <section id='for-dealers' aria-labelledby='dealer-invitation-title' className={styles.section}>
    <div className={styles.panel}>
      <div className={styles.copy}>
        <p className={styles.eyebrow}>Veltrenne for dealers</p>
        <h2 id='dealer-invitation-title'>Your inventory.<br /><span>A better first impression.</span></h2>
        <p className={styles.intro}>Give your vehicles a considered showcase, with clear details and a direct path for buyers to reach you.</p>
        <ul className={styles.benefits}><li>Present your vehicles with photos and specifications.</li><li>Manage your listings from your dealer workspace.</li><li>Let buyers contact your dealership directly.</li></ul>
        <div className={styles.actions}><Link className={styles.join} href='/register?role=dealer'>Join as a dealer <span aria-hidden='true'>↗</span></Link><Link className={styles.login} href='/login'>Dealer sign in</Link></div>
        <p className={styles.note}>Create an account, complete your dealership profile, and submit it for review.</p>
      </div>
      <div className={styles.visual}>
        <Image src='/brand/carvia-turntable-bk.webp' alt='' fill sizes='(max-width: 760px) 160vw, 100vw' className={styles.image} />
        <div className={styles.caption}><span>The Veltrenne showroom</span><p>A space for your<br />next opportunity.</p></div>
      </div>
    </div>
  </section>;
}
