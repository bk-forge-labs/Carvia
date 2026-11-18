'use client';

import Link from 'next/link';

export default function CarsError({ reset }: { reset: () => void }) {
  return (
    <main className='min-h-[65vh] bg-[var(--v-surface)] px-6 py-24 text-[var(--v-text)]'>
      <div className='mx-auto max-w-xl'>
        <p className='text-xs uppercase tracking-[.2em] text-[var(--v-accent)]'>Veltrenne collection</p>
        <h1 className='mt-5 text-4xl font-light'>We couldn’t load the vehicles.</h1>
        <p className='mt-5 leading-7 text-[var(--v-muted)]'>Vehicle search is temporarily unavailable. Please try again shortly.</p>
        <div className='mt-8 flex flex-wrap items-center gap-6'>
          <button type='button' onClick={reset} className='min-h-12 border border-[var(--v-border-strong)] px-6 text-[var(--v-text)] hover:bg-[var(--v-selected)]'>Try again</button>
          <Link href='/' className='underline underline-offset-4'>Back to Veltrenne</Link>
        </div>
      </div>
    </main>
  );
}
