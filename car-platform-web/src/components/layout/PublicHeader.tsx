'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import styles from './PublicHeader.module.css';

const links = [
  { href: '/cars', label: 'Explore cars' },
  { href: '/buyer/favorites', label: 'Saved vehicles' },
  { href: '/#our-approach', label: 'Our approach' },
  { href: '/#for-dealers', label: 'For dealers' },
];

function Arrow() {
  return (
    <svg width='16' height='16' viewBox='0 0 24 24' fill='none' aria-hidden='true'>
      <path d='M5 19 19 5M5 5h14v14' stroke='currentColor' strokeWidth='1.5' />
    </svg>
  );
}

export default function PublicHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  const [openPath, setOpenPath] = useState<string | null>(null);
  const isOpen = openPath === pathname;
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenPath(null);
        toggleRef.current?.focus();
      }
    };
    const outside = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setOpenPath(null);
    };
    const desktop = window.matchMedia('(min-width: 1000px)');
    const onResize = () => { if (desktop.matches) setOpenPath(null); };
    document.addEventListener('keydown', close);
    document.addEventListener('pointerdown', outside);
    desktop.addEventListener('change', onResize);
    return () => {
      document.removeEventListener('keydown', close);
      document.removeEventListener('pointerdown', outside);
      desktop.removeEventListener('change', onResize);
    };
  }, [isOpen]);

  const active = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header ref={headerRef} className={styles.header} data-home={pathname === '/'} data-scrolled={scrolled}>
      <div className={styles.inner}>
        <Link href='/' aria-label='Carvia home' className={styles.logo} onClick={() => setOpenPath(null)}>
          <Image
            src='/logo/carvia-lockup-champagne.png'
            alt=''
            width={2631}
            height={522}
            sizes='(min-width: 1000px) 220px, 186px'
            priority
          />
        </Link>

        <nav aria-label='Main navigation' className={styles.desktopNav}>
          {links.map(link => (
            <Link key={link.href} href={link.href} className={styles.navLink} aria-current={active(link.href) ? 'page' : undefined}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <Link href='/register' className={styles.join}>Sell your car</Link>
        </div>

        <button ref={toggleRef} type='button' className={styles.toggle} aria-expanded={isOpen} aria-controls='carvia-mobile-navigation' aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'} onClick={() => setOpenPath(isOpen ? null : pathname)}>
          <span>{isOpen ? 'Close' : 'Menu'}</span>
          <svg className={styles.menuIcon} width='22' height='22' viewBox='0 0 24 24' fill='none' aria-hidden='true'><path d={isOpen ? 'M6 6 18 18M6 18 18 6' : 'M3 8h18M3 16h18'} stroke='currentColor' strokeWidth='1.2' /></svg>
        </button>
      </div>

      <nav id='carvia-mobile-navigation' aria-label='Mobile navigation' className={styles.mobileNav} hidden={!isOpen} onBlur={event => {
        if (event.relatedTarget && !headerRef.current?.contains(event.relatedTarget as Node)) setOpenPath(null);
      }}>
        <div className={styles.mobileInner}>
          <p className={styles.eyebrow}>Discover Carvia</p>
          {links.map(link => (
            <Link key={link.href} href={link.href} className={styles.mobileLink} aria-current={active(link.href) ? 'page' : undefined} onClick={() => setOpenPath(null)}>
              {link.label}<Arrow />
            </Link>
          ))}
          <div className={styles.mobileActions}>
            <Link href='/login' className={styles.signIn} onClick={() => setOpenPath(null)}>Sign in</Link>
            <Link href='/register' className={styles.join} onClick={() => setOpenPath(null)}>Sell your car <Arrow /></Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
