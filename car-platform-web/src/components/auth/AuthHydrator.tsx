'use client';

import { useEffect } from 'react';
import { useState } from 'react';
import { ApiError } from '@/lib/api/browser';
import { getMe } from '@/lib/auth/api';
import { useAuth } from '@/lib/store/auth';

export default function AuthHydrator() {
  const [attempt, setAttempt] = useState(0);
  const sessionError = useAuth(s => s.sessionError);
  const setSessionError = useAuth(s => s.setSessionError);
  const setUser = useAuth(s => s.setUser);
  const clearUser = useAuth(s => s.clearUser);
  const setHydrated = useAuth(s => s.setHydrated);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const me = await getMe();
        if (!cancelled) { setUser(me); setSessionError(false); }
      } catch (error) {
        if (!cancelled) {
          if (error instanceof ApiError && error.status === 401) { clearUser(); setSessionError(false); }
          else setSessionError(true);
        }
      } finally {
        if (!cancelled) setHydrated();
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [setUser, clearUser, setHydrated, setSessionError, attempt]);

  return sessionError ? <div role='alert' style={{padding:'12px 6%',background:'var(--v-surface)',color:'var(--v-error)'}}>We couldn’t check your account connection. <button type='button' onClick={() => setAttempt(value => value + 1)} style={{textDecoration:'underline',marginLeft:12}}>Try again</button></div> : null;
}
