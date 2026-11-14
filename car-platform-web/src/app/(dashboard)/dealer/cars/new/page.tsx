import {requireApprovedDealer} from '@/lib/api/dealerProfile.server';
import Link from 'next/link';
import DealerCarCreateForm from '@/components/dealer/DealerCarCreateForm';
import styles from '@/components/dealer/DealerWorkspace.module.css';
export default async function DealerCarCreatePage() {
  await requireApprovedDealer('/dealer/cars/new');
  return <main className={styles.page}><div className={styles.inner}>
    <Link className={styles.back} href="/dealer/cars">← Back to inventory</Link>
    <header className={styles.heading}><div><p className={styles.eyebrow}>YOUR INVENTORY / NEW LISTING</p>
      <h1>Add a vehicle.</h1><p className={styles.intro}>Start with the essentials. Bring your listing to life with photos next.</p>
    </div></header>
    <DealerCarCreateForm />
  </div></main>;
}
