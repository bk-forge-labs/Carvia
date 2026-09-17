'use client';

import { useRef, useState } from 'react';
import styles from './DealerWorkspace.module.css';
import { useRouter } from 'next/navigation';

import { deleteDealerCarBrowser } from '@/lib/api/dealerCars.browser';

type Props = {
  carId: string;
};

export default function DeleteCarButton({ carId }: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const lock = useRef(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleDelete(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    if (lock.current) return;

    const confirmed = window.confirm(
      'Are you sure you want to delete this Car?',
    );

    if (!confirmed) {
      return;
    }

    try {
      lock.current = true;
      setLoading(true);
      setErrorMessage('');

      await deleteDealerCarBrowser(carId);

      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'This vehicle could not be deleted.');
    } finally {
      lock.current = false;
      setLoading(false);
    }
  }

  return (
    <div> <button
      type='button'
      onClick={handleDelete}
      disabled={loading}
      className={styles.danger}
    >
      {loading ? 'Deleting…' : 'Delete'}
    </button>{errorMessage && <p role='alert' className={styles.error}>{errorMessage}</p>}</div>
  );
}
