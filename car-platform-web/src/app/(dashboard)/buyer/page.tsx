import Link from 'next/link';
import styles from '@/components/layout/WorkspacePages.module.css';
export default function BuyerPage() {
  return <main className={styles.page}>
    <header><p className={styles.eyebrow}>Your Veltrenne</p><h1>Your next drive, taking shape.</h1><p>Return to the vehicles and conversations you’ve saved.</p></header>
    <div className={styles.grid}>
      <Link className={styles.card} href='/buyer/favorites'><h2>Saved vehicles</h2><p>Revisit your collection and compare your next steps.</p><span>Open collection ↗</span></Link>
      <Link className={styles.card} href='/buyer/enquiries'><h2>Your enquiries</h2><p>Follow the progress of your conversations with sellers.</p><span>Open enquiries ↗</span></Link>
      <Link className={styles.card} href='/bookings'><h2>Service bookings</h2><p>Check the status and details of existing service bookings.</p><span>View bookings ↗</span></Link>
    </div>
  </main>;
}
