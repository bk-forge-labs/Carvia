'use client';

import {usePathname} from 'next/navigation';
import AppHeader from './AppHeader';
import PublicHeader from './PublicHeader';

/** Non-workspace routes retain their existing public navigation. */
export default function DashboardHeader() {
  const path = usePathname();
  return path.startsWith('/buyer') ? <PublicHeader/> : <AppHeader/>;
}
