import Link from 'next/link';
import { HomeFooter } from '@/components/home/HomeClosing';
import styles from './Information.module.css';
const links = [{href:'/contact',label:'Contact & help'},{href:'/privacy',label:'Privacy'},{href:'/terms',label:'Terms of use'},{href:'/legal',label:'Legal notice'}];
export default function InformationLayout({active, eyebrow, title, intro, children, draft=false}:{active:string;eyebrow:string;title:string;intro:string;children:React.ReactNode;draft?:boolean}) {
 return <><main className={styles.page} id="information-top"><div className={styles.inner}>
 <Link className={styles.back} href="/">← Back to Veltrenne</Link>
 <header className={styles.hero}><p className={styles.eyebrow}>{eyebrow}</p><h1>{title}</h1><p className={styles.intro}>{intro}</p></header>
 <div className={styles.layout}><nav className={styles.navigation} aria-label="Information pages"><p>At your service</p>{links.map(link=><Link key={link.href} href={link.href} aria-current={active===link.href?'page':undefined}>{link.label}<span aria-hidden="true">↗</span></Link>)}</nav>
 <div className={styles.content}>{draft&&<aside className={styles.notice}><strong>Draft · Not yet effective</strong><p>This page is being prepared for launch. Operator details and final policies still need confirmation. It is not a complete legal notice or an active agreement.</p></aside>}{children}</div></div>
 </div></main><HomeFooter /></>;
}
