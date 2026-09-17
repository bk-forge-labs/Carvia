'use client';
import Link from 'next/link';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { login } from '@/lib/auth/api';
import { useAuth } from '@/lib/store/auth';
import { safeReturnTo } from '@/lib/auth/returnTo';
import styles from '@/components/cars/Collection.module.css';
function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = safeReturnTo(search.get('next'));
  const { user, hasHydrated, setUser } = useAuth();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  useEffect(() => {
    if (hasHydrated && user) router.replace(next || (user.role === 'admin' ? '/admin' : user.role === 'dealer' ? '/dealer' : '/buyer/favorites'));
  }, [hasHydrated, user, next, router]);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current || !hasHydrated) return;
    lock.current = true; setBusy(true); setError('');
    const form = new FormData(event.currentTarget);
    try { setUser(await login({email: String(form.get('email')).trim(), password: String(form.get('password'))})); }
    catch (error) { setError(error instanceof Error ? error.message : 'Sign-in failed. Please try again.'); }
    finally { lock.current = false; setBusy(false); }
  }
  return <main className={styles.auth}><section className={styles.authPanel}>
    <p className={styles.eyebrow}>Your Carvia</p><h1>Welcome back.</h1>
    <p className={styles.intro}>{next ? 'Sign in to continue where you left off.' : 'Keep the vehicles that catch your eye, all in one place.'}</p>
    <form onSubmit={submit} className={styles.form}>
      <label>Email address<input name='email' type='email' autoComplete='email' required /></label>
      <label>Password<input name='password' type='password' autoComplete='current-password' required /></label>
      {error && <p role='alert' className={styles.error}>{error}</p>}
      <button className={styles.primary} disabled={busy || !hasHydrated || !!user}>{busy ? 'Signing in…' : !hasHydrated ? 'Checking your session…' : 'Sign in'}</button>
    </form>
    <p className={styles.intro}>New to Carvia? <Link href={`/register${next ? `?next=${encodeURIComponent(next)}` : ''}`}>Create an account</Link></p>
    <Link className={styles.link} href={next || '/cars'}>← Continue browsing</Link>
  </section></main>;
}
export default function LoginPage() { return <Suspense fallback={<main className={styles.auth} aria-busy='true'>Loading sign-in…</main>}><LoginForm /></Suspense>; }
