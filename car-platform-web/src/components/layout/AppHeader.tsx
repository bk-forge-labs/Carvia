import Link from 'next/link';
import AuthStatus from '@/components/auth/AuthStatus';

export default function AppHeader() {
  return (
    <header className='border-b'>
      <div className='mx-auto max-w-5xl px-6 py-4 flex items-center justify-between'>
        <Link href='/' className='font-semibold'>
          Car platform
        </Link>
        <nav className='flex items-center gap-4'>
          <Link className='text-sm underline' href='/cars'>
            Cars
          </Link>
          <Link className='text-sm underline' href='/services'>
            Services
          </Link>
          <AuthStatus />
        </nav>
      </div>
    </header>
  );
}
