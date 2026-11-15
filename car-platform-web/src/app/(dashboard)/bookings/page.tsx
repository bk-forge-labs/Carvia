import RequireAuth from '@/components/auth/RequireAuth';
import Bookings from '@/components/bookings/Bookings';
export default function BookingsPage() {
  return <RequireAuth allow={['buyer', 'admin']}><Bookings/></RequireAuth>;
}
