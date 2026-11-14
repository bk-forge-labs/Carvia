'use client';

import Link from 'next/link';
import styles from '@/components/cars/Collection.module.css';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import { registerBrowser } from '@/lib/api/auth.browser';
import type { RegisterBrowserPayload } from '@/lib/api/auth.browser';
import { safeReturnTo } from '@/lib/auth/returnTo';
import { useAuth } from '@/lib/store/auth';

function RegisterForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const next = safeReturnTo(searchParams.get('next'));
  const setUser = useAuth(s => s.setUser);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<RegisterBrowserPayload['role']>(searchParams.get('role') === 'dealer' ? 'dealer' : 'buyer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      setError('');

      const data = await registerBrowser({
        name,
        email,
        password,
        role,
      });

      if (data.user) {
        const id = data.user.id ?? data.user._id;
        if (id) {
          setUser({
            id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
          });
        }
      }

      router.push(role === 'dealer' ? '/dealer/onboarding' : next || '/buyer/favorites');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.auth}>
      <section className={styles.authPanel}>
        <div>
          <p className={styles.eyebrow}>
            Join Veltrenne
          </p>
          <h1>
            Create your account
          </h1>
          <p className={styles.intro}>
            Register as a buyer or dealer and continue into Veltrenne.
          </p>
        </div>

        {error ? (
          <p className={styles.error}>
            {error}
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className={styles.form}>
          <label>
            <span>Name</span>
            <input
              autoComplete='name' minLength={2} maxLength={50} value={name}
              onChange={e => setName(e.target.value)}
              required

              placeholder='Your name'
            />
          </label>

          <label>
            <span>Email</span>
            <input
              type='email' autoComplete='email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              required

              placeholder='you@example.com'
            />
          </label>

          <label>
            <span>Password</span>
            <input
              type='password' autoComplete='new-password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={12}

              placeholder='At least 12 characters'
            />
          </label>

          <label>
            <span>Role</span>
            <select
              value={role}
              onChange={e =>
                setRole(e.target.value as RegisterBrowserPayload['role'])
              }

            >
              <option value='buyer'>Buyer</option>
              <option value='dealer'>Dealer</option>
            </select>
          </label>

          <button
            type='submit'
            disabled={loading}
            className={styles.primary}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className={styles.intro}>
          Already have an account?{' '}
          <Link href={next ? `/login?next=${encodeURIComponent(next)}` : '/login'} className={styles.link}>
            Log in
          </Link>
        </p>
      </section>
    </main>
  );
}

export default function RegisterPage() {
  return <Suspense fallback={<main aria-busy='true'>Loading registration…</main>}><RegisterForm /></Suspense>;
}
