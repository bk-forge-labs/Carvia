'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { api, ApiError } from '@/lib/api/browser';
import styles from './DealerDirectory.module.css';
type Action = { label: string; path: string; consequence: string };
export default function ReviewAction({
  actions,
  updatedAt,
  release = false,
  onDone,
}: {
  actions: Action[];
  updatedAt: string;
  release?: boolean;
  onDone: (message: string) => void;
}) {
  const [selected, setSelected] = useState<Action | null>(null);
  const [note, setNote] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const [error, setError] = useState('');
  const [stale, setStale] = useState(false);
  useEffect(() => {
    if (selected) {
      if (confirming) confirmRef.current?.focus();
      else
        formRef.current?.querySelector<HTMLElement>('input,textarea')?.focus();
    }
  }, [selected, confirming]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!selected || lock.current || stale) return;
    if (note.trim().length < 10) {
      setError('Add a review note of at least 10 characters.');
      return;
    }
    if (!confirming) {
      setError('');
      setConfirming(true);
      return;
    }
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      const result = await api<{
        success: boolean;
        message?: string;
        unpublished?: number;
      }>(selected.path, {
        method: 'PUT',
        body: {
          expectedUpdatedAt: updatedAt,
          note: note.trim(),
          confirmations: checks,
        },
      });
      if (!result.success) throw new Error('Review was not saved.');
      onDone(
        release
          ? 'Hold released. This vehicle remains a draft.'
          : `${selected.label} completed.${result.unpublished ? ` ${result.unpublished} listings unpublished.` : ''}`,
      );
    } catch (err) {
      const conflict = err instanceof ApiError && err.status === 409;
      setStale(conflict);
      setError(
        err instanceof ApiError
          ? err.message
          : 'The result could not be confirmed. Reload the record before trying again.',
      );
      if (!(err instanceof ApiError)) setStale(true);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <section className={styles.panel} aria-labelledby='review-action-title'>
      <h2 id='review-action-title'>
        {release ? 'Release review hold' : 'Review decision'}
      </h2>
      {!selected ? (
        <div className={styles.actions}>
          {actions.map(action => (
            <button
              key={action.path}
              type='button'
              onClick={() => setSelected(action)}
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : (
        <form ref={formRef} onSubmit={submit} className={styles.reviewForm}>
          <h3>{selected.label}</h3>
          <p>{selected.consequence}</p>
          <fieldset disabled={busy || confirming}>
            <legend className={styles.srOnly}>Review evidence</legend>
            {release && (
              <div className={styles.checks}>
                {[
                  [
                    'identity',
                    'Make, model, year and mileage match the vehicle records.',
                  ],
                  [
                    'photographs',
                    'Every photograph shows this actual vehicle and is authorised for use.',
                  ],
                  [
                    'price',
                    'The asking price is current and confirmed by the seller.',
                  ],
                  [
                    'seller',
                    'The seller’s authority to offer this vehicle has been checked.',
                  ],
                ].map(([key, label]) => (
                  <label key={key}>
                    <input
                      type='checkbox'
                      required
                      checked={!!checks[key]}
                      onChange={event =>
                        setChecks(previous => ({
                          ...previous,
                          [key]: event.target.checked,
                        }))
                      }
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            )}
            <label className={styles.note}>
              Review note
              <textarea
                required
                minLength={10}
                maxLength={2000}
                rows={4}
                value={note}
                onChange={event => setNote(event.target.value)}
                placeholder='Record the evidence checked and the reason for this decision.'
              />
            </label>
          </fieldset>
          {confirming && (
            <p className={styles.confirmation}>
              Confirm this decision for the record shown above. Your account,
              note and time will be recorded.
            </p>
          )}
          {error && (
            <p role='alert' className={styles.error}>
              {error}
            </p>
          )}
          <div className={styles.actions}>
            {stale ? (
              <button
                type='button'
                onClick={() =>
                  onDone(
                    'Record refreshed. Review its current state before continuing.',
                  )
                }
              >
                Reload record
              </button>
            ) : (
              <button ref={confirmRef} type='submit' disabled={busy}>
                {busy
                  ? 'Saving decision…'
                  : confirming
                    ? `Confirm ${selected.label.toLowerCase()}`
                    : 'Review decision'}
              </button>
            )}
            <button
              type='button'
              disabled={busy}
              onClick={() => {
                setSelected(null);
                setConfirming(false);
                setError('');
                setNote('');
                setChecks({});
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
