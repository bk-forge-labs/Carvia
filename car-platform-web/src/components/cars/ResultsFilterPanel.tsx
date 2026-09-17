'use client';
import { useState, type ReactNode } from 'react';
import styles from '@/app/(public)/cars/results.module.css';
export default function ResultsFilterPanel({ children, active }: { children: ReactNode; active: number }) {
  const [open, setOpen] = useState(false);
  return <div><button type='button' className={styles.filterToggle} aria-expanded={open} aria-controls='carvia-filter-fields' onClick={() => setOpen(value => !value)}>Filters & sorting{active ? ` · ${active} active` : ''}<span aria-hidden='true'>{open ? '−' : '+'}</span></button><div id='carvia-filter-fields' className={styles.filterContents} data-open={open}>{children}</div></div>;
}
