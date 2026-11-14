'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInHref } from '@/lib/auth/returnTo';
import { useAuth } from '@/lib/store/auth';
import type { Role } from '@/lib/auth/types';
/* import { handleBuildComplete } from 'next/dist/build/adapter/build-complete'; */

export default function RequireAuth({
  allow,
  children,
}: {
  allow: Role[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const user = useAuth(s => s.user);
  const sessionError = useAuth(s => s.sessionError);
  const hasHydrated = useAuth(s => s.hasHydrated);

  useEffect(() => {
    if (!hasHydrated || sessionError) return;
    if (!user) {
      router.replace(signInHref(window.location.pathname + window.location.search));
      return;
    }
    if (!allow.includes(user.role)) {
      router.replace('/login');
    }
  }, [hasHydrated, sessionError, user, allow, router]);

  if (sessionError) return <p role="status" style={{padding:24}}>Your account connection is unavailable. Use Try again above to reconnect.</p>;
  if (!hasHydrated) return null; //Don't render until hydration is complete
  if (!user || !allow.includes(user.role)) return null;

  return <>{children}</>;
}
