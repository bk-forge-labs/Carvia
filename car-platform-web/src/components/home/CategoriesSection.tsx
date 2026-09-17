"use client";

import { useEffect, useRef, type CSSProperties } from 'react';
import styles from './CategoriesSection.module.css';
import RotatingCategoryCard from './RotatingCategoryCard';

const categories = [
  ['SUVs', 'suv', 'SUV'],
  ['Sedans', 'sedan', 'sedan'],
  ['Electric', 'electric', 'electric'],
  ['Luxury', 'luxury', 'luxury'],
  ['Sports', 'sports', 'sports'],
  ['Vans', 'van', 'van'],
] as const;

export default function CategoriesSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !('IntersectionObserver' in window)) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const items = [...section.querySelectorAll<HTMLElement>('[data-category-reveal]')];
    let observer: IntersectionObserver | undefined;
    const revealAll = () => items.forEach(item => item.removeAttribute('data-pending'));
    const configure = () => {
      observer?.disconnect();
      if (motion.matches) { revealAll(); return; }
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.removeAttribute('data-pending');
          observer?.unobserve(entry.target);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      items.forEach(item => {
        // Never hide content already visible on a restored scroll position.
        if (item.getBoundingClientRect().top >= window.innerHeight) {
          item.setAttribute('data-pending', 'true');
          observer?.observe(item);
        }
      });
    };
    configure();
    motion.addEventListener('change', configure);
    return () => { observer?.disconnect(); motion.removeEventListener('change', configure); revealAll(); };
  }, []);

  return (
    <section ref={sectionRef} aria-labelledby='categories-title' className={`${styles.section} border-b border-white/10 bg-[#050608] px-6 py-16`}>
      <div className='mx-auto max-w-6xl'>
        <div data-category-reveal className={`${styles.reveal} mb-8`}>
          <p className='text-sm uppercase tracking-[0.22em] text-[#D4AF37]'>Categories</p>
          <h2 id='categories-title' className='mt-3 text-3xl font-semibold text-white'>Shop by body style</h2>
        </div>
        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-6'>
          {categories.map(([label, model, motionLabel], index) => (
            <div key={label} data-category-reveal className={styles.reveal} style={{ '--reveal-delay': `${index * 75}ms` } as CSSProperties}>
              <RotatingCategoryCard category={label} model={model} motionLabel={motionLabel} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
