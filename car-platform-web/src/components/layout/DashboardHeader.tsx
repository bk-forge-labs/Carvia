'use client';
import EnquiryCount from '@/components/enquiries/EnquiryCount';
import {usePathname} from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import AppHeader from './AppHeader';
import adminStyles from './AdminHeader.module.css';
import PublicHeader from './PublicHeader';
import AccountMenu from '@/components/auth/AccountMenu';
import styles from '@/components/dealer/DealerWorkspace.module.css';
export default function DashboardHeader(){
 const path=usePathname();
 if(path.startsWith('/buyer'))return <PublicHeader/>;
 if(path==='/admin'||path.startsWith('/admin/'))return <header className={adminStyles.header}><div className={adminStyles.inner}><Link className={adminStyles.logo} href='/' aria-label='Veltrenne home'><Image src='/logo/veltrenne/horizontal-gold.svg' width={220} height={27} alt='' priority/></Link><nav className={adminStyles.navigation} aria-label='Administration navigation'>{[{href:'/admin',label:'Overview'},{href:'/admin/dealers',label:'Dealer reviews'},{href:'/admin/cars',label:'Inventory review'}].map(item=><Link key={item.href} href={item.href} aria-current={(item.href==='/admin'?path===item.href:path===item.href||path.startsWith(item.href+'/'))?'page':undefined}>{item.label}</Link>)}<Link href='/cars'>Marketplace ↗</Link></nav><div className={adminStyles.account}><AccountMenu/></div></div></header>;
 if(path!=='/dealer'&&!path.startsWith('/dealer/'))return <AppHeader/>;
 return <header className={styles.workspaceHeader}><div><Link href='/' aria-label='Veltrenne home'><Image src='/logo/veltrenne/horizontal-gold.svg' width={220} height={27} alt='' priority/></Link><nav aria-label='Dealer navigation'><Link href='/dealer' aria-current={path==='/dealer'?'page':undefined}>Overview</Link><Link href='/dealer/cars' aria-current={path.startsWith('/dealer/cars')?'page':undefined}>Inventory</Link><Link href='/dealer/enquiries' aria-current={path==='/dealer/enquiries'?'page':undefined}>Enquiries<EnquiryCount/></Link><Link href='/cars'>View marketplace ↗</Link></nav><AccountMenu/></div></header>;
}
