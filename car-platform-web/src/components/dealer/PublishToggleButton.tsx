'use client';

import { useRef, useState } from 'react';
import styles from './DealerWorkspace.module.css';
import { useRouter } from 'next/navigation';

type Props = {
  carId: string;
  isPublished: boolean;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5050/api';

export default function PublishToggleButton({ carId, isPublished }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const lock = useRef(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleToggle(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    if (lock.current) return;

    try {
      lock.current = true;
      setLoading(true);
      setErrorMessage('');

      const action = isPublished ? 'unpublish' : 'publish';

      const res = await fetch(
        `${API_BASE_URL}/dealer/cars/${carId}/${action}`,
        { method: 'PUT', credentials: 'include' },
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update publish state');
      }

      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Publication could not be updated.');
    } finally {
      lock.current = false;
      setLoading(false);
    }
  }

  return (
    <div> <button
      type='button'
      onClick={handleToggle}
      disabled={loading}
      className={styles.secondary}
    >
      {loading ? 'Updating…' : isPublished ? 'Unpublish' : 'Publish'}
    </button>{errorMessage && <p role='alert' className={styles.error}>{errorMessage}</p>}</div>
  );
}
