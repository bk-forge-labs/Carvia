import DealerCarImagesManager from '@/components/dealer/DealerCarImagesManager';
import {getDealerCarByIdServer} from '@/lib/api/dealerCars.server';
import Link from 'next/link';
import styles from '@/components/dealer/DealerWorkspace.module.css';
export default async function DealerCarImagesPage({params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 const car=await getDealerCarByIdServer(id);
 return <main className={styles.page}><div className={styles.inner}>
   <Link className={styles.back} href={`/dealer/cars/${id}`}>← Back to vehicle</Link>
   <header className={styles.heading}><div><p className={styles.eyebrow}>YOUR INVENTORY / PHOTOGRAPHY</p><h1>Show every detail.</h1><p className={styles.intro}>{car.title} — curate your vehicle’s gallery.</p></div></header>
   <DealerCarImagesManager key={car._id} car={car}/>
 </div></main>;
}
