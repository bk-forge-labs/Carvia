'use client';

import Link from 'next/link';

export default function CarsError({ reset }: { reset: () => void }) {
  return (
    <main className='min-h-[65vh] bg-[#151513] px-6 py-24 text-[#f5f2eb]'>
      <div className='mx-auto max-w-xl'>
        <p className='text-xs uppercase tracking-[.2em] text-[#cbb18f]'>Carvia collection</p>
        <h1 className='mt-5 text-4xl font-light'>We couldn’t load the vehicles.</h1>
        <p className='mt-5 leading-7 text-[#c9c3b9]'>Vehicle search is temporarily unavailable. Please try again shortly.</p>
        <div className='mt-8 flex flex-wrap items-center gap-6'>
          <button type='button' onClick={reset} className='min-h-12 border border-[#b7a080] px-6 text-[#f5f2eb] hover:bg-[#b7a080]/10'>Try again</button>
          <Link href='/' className='underline underline-offset-4'>Back to Carvia</Link>
        </div>
      </div>
    </main>
  );
}
