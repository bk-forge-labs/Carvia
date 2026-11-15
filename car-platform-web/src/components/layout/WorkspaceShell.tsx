'use client';

import {useEffect, useRef, useState, type ReactNode} from 'react';
import {usePathname} from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import AccountMenu from '@/components/auth/AccountMenu';
import EnquiryCount from '@/components/enquiries/EnquiryCount';
import RequireAuth from '@/components/auth/RequireAuth';
import {useAuth} from '@/lib/store/auth';
import type {Role} from '@/lib/auth/types';
import styles from './WorkspaceShell.module.css';

type IconName = 'overview' | 'cars' | 'people' | 'mail' | 'settings' | 'arrow' | 'panel' | 'search' | 'close' | 'plus';
type Destination = {href: string; label: string; icon: IconName; description: string};
function Icon({name}: {name: IconName}) {
  const paths: Record<IconName, ReactNode> = {
    overview: <><rect x='3' y='3' width='7' height='7' rx='2'/><rect x='14' y='3' width='7' height='7' rx='2'/><rect x='3' y='14' width='7' height='7' rx='2'/><rect x='14' y='14' width='7' height='7' rx='2'/></>,
    cars: <><path d='m5 7 2-4h10l2 4 2 3v8H3v-8l2-3Z M3 10h18 M6 14h2m8 0h2 M5 18v3m14-3v3'/></>,
    people: <><circle cx='9' cy='7' r='3'/><path d='M3 21v-3a6 6 0 0 1 12 0v3 M16 4a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 4v3'/></>,
    mail: <><rect x='3' y='5' width='18' height='14' rx='3'/><path d='m3 6 9 7 9-7'/></>,
    settings: <><path d='M4 7h16M4 17h16'/><circle cx='9' cy='7' r='3'/><circle cx='15' cy='17' r='3'/></>,
    arrow: <path d='M5 19 19 5M5 5h14v14'/>,
    panel: <><rect x='3' y='4' width='18' height='16' rx='3'/><path d='M9 4v16'/></>,
    search: <><circle cx='10.5' cy='10.5' r='6.5'/><path d='m16 16 5 5'/></>,
    close: <path d='m6 6 12 12M6 18 18 6'/>,
    plus: <path d='M12 5v14M5 12h14'/>,
  };
  return <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>{paths[name]}</svg>;
}

const workspaceRoles: Role[] = ['buyer', 'dealer', 'admin'];

export default function WorkspaceShell({children}: {children: ReactNode}) {
  const path = usePathname();
  const role = useAuth(state => state.user?.role);
  return <RequireAuth allow={workspaceRoles}>{role && <Workspace key={role} role={role} path={path}>{children}</Workspace>}</RequireAuth>;
}

function Workspace({role, path, children}: {role: Role; path: string; children: ReactNode}) {
  const admin = role === 'admin';
  const dealer = role === 'dealer';
  const workspaceLabel = admin ? 'Administration' : dealer ? 'Dealer workspace' : 'Your workspace';
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState('');
  const navigation = useRef<HTMLDialogElement>(null);
  const command = useRef<HTMLDialogElement>(null);
  const mobileTrigger = useRef<HTMLButtonElement>(null);
  const searchTrigger = useRef<HTMLButtonElement>(null);
  const previousPath = useRef(path);
  const searchInput = useRef<HTMLInputElement>(null);
  function openSearch() {
    setQuery('');
    command.current?.showModal();
    searchInput.current?.focus();
  }
  useEffect(() => {
    if (previousPath.current !== path) {
      window.scrollTo({top: 0, behavior: 'instant'});
      document.getElementById('workspace-content')?.focus({preventScroll: true});
      previousPath.current = path;
    }
  }, [path]);
  const root = admin ? '/admin' : dealer ? '/dealer' : '/buyer';
  const operations: Destination[] = [
    {href:'/calendar',label:'Calendar',icon:'overview',description:'Your private meetings and test drives'},
    {href:'/tasks',label:'Follow-up tasks',icon:'people',description:'Your next actions and due dates'},
    {href:'/email',label:'Email history',icon:'mail',description:'Confirmation acceptance and failure records'},
  ];
  const destinations: Destination[] = admin ? [
    {href: root, label: 'Overview', icon: 'overview', description: 'Your review queues at a glance'},
    {href: '/admin/dealers', label: 'Dealer reviews', icon: 'people', description: 'Applications, approvals and dealerships'},
    {href: '/admin/cars', label: 'Inventory review', icon: 'cars', description: 'Listing quality and publication holds'},
    {href: '/bookings', label: 'Bookings', icon: 'overview', description: 'Service booking records'},
    ...operations,
  ] : dealer ? [
    {href: root, label: 'Overview', icon: 'overview', description: 'Your showroom at a glance'},
    {href: '/dealer/cars', label: 'Inventory', icon: 'cars', description: 'Find, prepare and publish your vehicles'},
    {href: '/dealer/enquiries', label: 'Enquiries', icon: 'mail', description: 'Buyer conversations and follow-ups'},
    ...operations,
  ] : [
    {href: root, label: 'Overview', icon: 'overview', description: 'Your saved vehicles and conversations'},
    {href: '/buyer/favorites', label: 'Saved vehicles', icon: 'cars', description: 'Vehicles in your collection'},
    {href: '/buyer/enquiries', label: 'Enquiries', icon: 'mail', description: 'Your conversations with sellers'},
    {href: '/bookings', label: 'Bookings', icon: 'overview', description: 'Your service booking records'},
  ];
  const utilities: Destination[] = [
    {href: '/account', label: 'Account settings', icon: 'settings', description: 'Profile and account security'},
    {href: '/cars', label: 'Marketplace', icon: 'arrow', description: 'Explore the public vehicle collection'},
  ];
  const active = [...destinations, ...utilities].find(item => item.href === root ? path === root : path === item.href || path.startsWith(item.href + '/'));
  const title = active?.label || (path.endsWith('/onboarding') ? 'Dealer application' : path.endsWith('/pending') ? 'Application status' : 'Workspace');
  const results = [...destinations, ...utilities].filter(item => `${item.label} ${item.description}`.toLowerCase().includes(query.toLowerCase().trim()));
  useEffect(() => {
    function shortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        navigation.current?.close();
        if (!command.current?.open) { setQuery(''); command.current?.showModal(); searchInput.current?.focus(); }
      }
    }
    document.addEventListener('keydown', shortcut);
    return () => document.removeEventListener('keydown', shortcut);
  }, []);
  function closeNavigation() { navigation.current?.close(); }
  function links(items: Destination[], mobile = false) {
    return items.map(item => <Link key={item.href} href={item.href} className={styles.navLink} title={collapsed && !mobile ? item.label : undefined} aria-label={item.label} aria-current={item === active ? 'page' : undefined} onNavigate={closeNavigation}>
      <Icon name={item.icon}/><span className={styles.navLabel}>{item.label}</span>{dealer && item.href === '/dealer/enquiries' && <span className={styles.count}><EnquiryCount/></span>}
    </Link>);
  }
  function sidebar(mobile = false) {
    return <>
      <Link href={root} className={styles.brand} aria-label='Veltrenne workspace' onNavigate={closeNavigation}>
        <Image className={styles.emblem} src='/logo/veltrenne/emblem-gold.svg' alt='' width={32} height={32}/>
        <span className={styles.wordmark}><Image src='/logo/veltrenne/horizontal-gold.svg' alt='Veltrenne' width={154} height={20}/><small>{workspaceLabel}</small></span>
      </Link>
      <nav aria-label={mobile ? 'Mobile workspace navigation' : 'Workspace navigation'} className={styles.nav}>
        <p className={styles.groupLabel}>{admin ? 'Marketplace operations' : dealer ? 'Your business' : 'Your collection'}</p>{links(destinations, mobile)}
        <p className={styles.groupLabel}>Workspace</p>{links(utilities, mobile)}
      </nav>
      <div className={styles.sidebarFooter}>{mobile ? <button className={styles.collapse} onClick={closeNavigation}><Icon name='close'/><span>Close navigation</span></button> : <button className={styles.collapse} aria-expanded={!collapsed} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} onClick={() => setCollapsed(value => !value)}><Icon name='panel'/><span className={styles.navLabel}>Collapse sidebar</span></button>}</div>
    </>;
  }
  return <div className={styles.shell} data-collapsed={collapsed}>
    <a href='#workspace-content' className={styles.skip}>Skip to workspace content</a>
    <aside className={styles.sidebar}>{sidebar()}</aside>
    <div className={styles.workspace}>
      <header className={styles.topbar}>
        <button ref={mobileTrigger} className={`${styles.iconButton} ${styles.mobileMenu}`} aria-label='Open navigation' aria-haspopup='dialog' onClick={() => navigation.current?.showModal()}><Icon name='panel'/></button>
        <div className={styles.breadcrumb}><span>{workspaceLabel}</span><span aria-hidden='true'>/</span><strong>{title}</strong></div>
        <button ref={searchTrigger} className={styles.search} aria-label='Find a workspace page' aria-haspopup='dialog' onClick={openSearch}><Icon name='search'/><span>Find a workspace page</span><kbd>⌘ / Ctrl K</kbd></button>
        <div className={styles.account}><AccountMenu/></div>
      </header>
      <div id='workspace-content' tabIndex={-1} className={styles.content}>
        <div key={path} className={styles.transition}>{children}</div>
      </div>
      <footer className={styles.workspaceFooter}><span>VELTRENNE <span>/ {workspaceLabel}</span></span><Link href='/contact'>Help & support <span aria-hidden='true'>↗</span></Link></footer>
    </div>
    <dialog ref={navigation} className={styles.mobileDialog} aria-label='Workspace navigation' onClose={() => mobileTrigger.current?.focus()}>{sidebar(true)}</dialog>
    <dialog ref={command} className={styles.command} aria-labelledby='workspace-search-title' onClose={() => searchTrigger.current?.focus()}>
      <div className={styles.commandHeading}><div><p className={styles.groupLabel}>Quick navigation</p><h2 id='workspace-search-title'>Where would you like to go?</h2></div><button className={styles.iconButton} aria-label='Close search' onClick={() => command.current?.close()}><Icon name='close'/></button></div>
      <label className={styles.searchField}><Icon name='search'/><span className={styles.srOnly}>Find a workspace page</span><input ref={searchInput} value={query} onChange={event => setQuery(event.target.value)} placeholder='Inventory, enquiries, settings…'/></label>
      <nav aria-label='Workspace search results' className={styles.results}>{results.length ? results.map(item => <Link key={item.href} href={item.href} onNavigate={() => command.current?.close()}><Icon name={item.icon}/><span><strong>{item.label}</strong><small>{item.description}</small></span><span aria-hidden='true'>↗</span></Link>) : <p role='status'>No matching pages. Try “inventory” or “account”.</p>}</nav>
      <p className={styles.commandHint}>Navigate with Tab · Open with Enter · Close with Escape</p>
    </dialog>
  </div>;
}
