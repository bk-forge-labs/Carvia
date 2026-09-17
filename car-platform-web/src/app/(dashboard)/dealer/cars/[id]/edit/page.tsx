import Link from 'next/link';
import DealerCarEditForm from '@/components/dealer/DealerCarEditForm';
import {getDealerCarByIdServer} from '@/lib/api/dealerCars.server';
import styles from '@/components/dealer/DealerWorkspace.module.css';
export default async function DealerEditCarPage({params}:{params:Promise<{id:string}>}){
 const {id}=await params;const car=await getDealerCarByIdServer(id);
 return <main className={styles.page}><div className={styles.inner}>
 <Link className={styles.back} href={`/dealer/cars/${id}`}>← Back to vehicle</Link>
 <header className={styles.heading}><div><p className={styles.eyebrow}>YOUR INVENTORY / EDIT DETAILS</p><h1>Refine your listing.</h1><p className={styles.intro}>{car.title} — keep buyers informed with accurate details.</p></div></header>
 <DealerCarEditForm car={car}/></div></main>;
}
