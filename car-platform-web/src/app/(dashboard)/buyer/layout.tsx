import RequireAuth from '@/components/auth/RequireAuth';
export default function BuyerLayout({children}: {children: React.ReactNode}) {
  return <RequireAuth allow={['buyer']}>{children}</RequireAuth>;
}
