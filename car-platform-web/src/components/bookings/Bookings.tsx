'use client';

import {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {api, ApiError} from '@/lib/api/browser';
import {useAuth} from '@/lib/store/auth';
import styles from '@/components/layout/WorkspacePages.module.css';

type Booking = {
  _id: string;
  service: {title: string; durationMinutes?: number} | null;
  user?: {name: string; email: string} | null;
  scheduledAt: string;
  status: 'pending' | 'approved' | 'cancelled' | 'completed';
  note?: string;
  cancelReason?: string;
};
type Result = {
  success: boolean;
  data: Booking[];
  pagination: {page: number; totalPages: number; totalBookings: number};
};
const labels = {pending: 'Pending', approved: 'Approved', cancelled: 'Cancelled', completed: 'Completed'};

export default function Bookings() {
  const user = useAuth(state => state.user);
  const admin = user?.role === 'admin';
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ['bookings', user?.id, status, page],
    queryFn: ({signal}) => api<Result>(`${admin ? '/admin/bookings' : '/bookings/me'}?page=${page}&status=${status}`, {signal}),
    enabled: user?.role === 'buyer' || admin,
    retry: false,
    gcTime: 0,
  });
  return <main className={styles.page}>
    <header><p className={styles.eyebrow}>{admin ? 'Administration' : 'Your Veltrenne'} / Bookings</p><h1>{admin ? 'Service booking records.' : 'Your service bookings.'}</h1><p>Review existing booking details and their current status. Dates use your device’s local time zone.</p></header>
    <div className={styles.toolbar}><label htmlFor='booking-status'>Booking status</label><select id='booking-status' value={status} onChange={event => {setStatus(event.target.value); setPage(1);}}><option value=''>All statuses</option>{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
    {query.isPending ? <p role='status'>Loading bookings…</p> : query.isError ? <section className={styles.panel} role='alert'><h2>Bookings couldn’t load.</h2><p>{query.error instanceof ApiError ? query.error.message : 'Check your connection and try again.'}</p><button onClick={() => void query.refetch()}>Try again</button></section> : !query.data?.data.length ? <section className={styles.panel}><h2>{status ? 'No bookings with this status.' : 'No service bookings yet.'}</h2><p>{status ? 'Choose another status to see your booking records.' : 'Existing service bookings will appear here.'}</p>{status && <button onClick={() => {setStatus(''); setPage(1);}}>View all statuses</button>}{page > 1 && <button onClick={() => setPage(1)}>Back to first page</button>}</section> : <>
      <p role='status'>{query.data.pagination.totalBookings} {query.data.pagination.totalBookings === 1 ? 'booking' : 'bookings'}</p>
      <section className={styles.grid} aria-label='Service bookings'>{query.data.data.map(booking => <article className={styles.panel} key={booking._id}>
        <span className={styles.badge} data-status={booking.status}>{labels[booking.status]}</span>
        <h2>{booking.service?.title || 'Service no longer available'}</h2>
        <dl><div><dt>Scheduled for</dt><dd><time dateTime={booking.scheduledAt}>{new Date(booking.scheduledAt).toLocaleString('en-GB', {dateStyle: 'medium', timeStyle: 'short'})}</time></dd></div>{booking.service?.durationMinutes != null && <div><dt>Duration</dt><dd>{booking.service.durationMinutes} minutes</dd></div>}{admin && <div><dt>Customer</dt><dd>{booking.user?.name || 'Account unavailable'}{booking.user?.email && <span>{booking.user.email}</span>}</dd></div>}</dl>
        {booking.note && <p>{booking.note}</p>}{booking.cancelReason && <p>Cancellation reason — {booking.cancelReason}</p>}
      </article>)}</section>
      {query.data.pagination.totalPages > 1 && <nav className={styles.pagination} aria-label='Booking pages'><button disabled={page <= 1} onClick={() => setPage(value => value - 1)}>Previous</button><span>Page {page} of {query.data.pagination.totalPages}</span><button disabled={page >= query.data.pagination.totalPages} onClick={() => setPage(value => value + 1)}>Next</button></nav>}
    </>}
  </main>;
}
