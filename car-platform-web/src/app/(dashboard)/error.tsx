'use client';
import Link from 'next/link';
import styles from '@/components/layout/WorkspacePages.module.css';
export default function WorkspaceError({reset}: {reset: () => void}) {
  return <main className={styles.page}><section className={styles.panel} role='alert'><h1>This page couldn’t load.</h1><p>Check your connection and try again. If this record was removed or your access changed, return to your workspace.</p><div className={styles.toolbar}><button onClick={reset}>Try again</button><Link href='/account'>Open your account</Link></div></section></main>;
}
