import './globals.css';
import type { Metadata } from 'next';
import Providers from './providers';
import AuthHydrator from '../components/auth/AuthHydrator';

export const metadata: Metadata = {
  title: 'Veltrenne | Find your next drive',
  description: 'Explore vehicles, save your favourites and connect with dealers on Veltrenne.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body>
        <Providers>
          <AuthHydrator />
          {children}
        </Providers>
      </body>
    </html>
  );
}
