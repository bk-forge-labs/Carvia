import Link from 'next/link';
import styles from './HowCarviaWorks.module.css';

const steps = [
  { number: '01', title: 'Find your fit.', text: 'Start with the make, body style and budget that suit you. Explore the vehicles that match.', detail: 'Search with purpose', path: <><circle cx='10.5' cy='10.5' r='6.5' /><path d='m16 16 5 5' /></> },
  { number: '02', title: 'Look a little closer.', text: 'Explore the photos, specifications and seller details. Save the vehicles you want to come back to.', detail: 'Get to know the vehicle', path: <><rect x='5' y='3' width='14' height='18' rx='2' /><path d='M9 8h6M9 12h6M9 16h4' /></> },
  { number: '03', title: 'Make the connection.', text: 'Use the contact details on the listing to ask the seller questions and discuss a viewing or test drive.', detail: 'Speak directly with the seller', path: <path d='M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-2 2V11.5A8.5 8.5 0 0 1 10.5 3h2A8.5 8.5 0 0 1 21 11.5Z' /> },
];

export default function HowCarviaWorks() {
  return <section id='our-approach' aria-labelledby='how-carvia-title' className={styles.section}>
    <div className={styles.inner}>
      <div className={styles.heading}>
        <div><p className={styles.eyebrow}>How Carvia works</p><h2 id='how-carvia-title'>Your next chapter.<br /><span>Three simple steps.</span></h2></div>
        <p className={styles.intro}>From the first look to the first conversation, a clear path to your next vehicle.</p>
      </div>
      <ol className={styles.steps}>
        {steps.map(step => <li key={step.number} className={styles.step}>
          <div className={styles.stepTop}><span className={styles.number} aria-hidden='true'>{step.number}</span><svg viewBox='0 0 24 24' width='26' height='26' fill='none' stroke='currentColor' strokeWidth='1.25' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>{step.path}</svg></div>
          <h3>{step.title}</h3><p>{step.text}</p><span className={styles.detail}>{step.detail}</span>
        </li>)}
      </ol>
      <div className={styles.footer}><p>Take the first look. See where it leads.</p><Link href='/cars'>Explore vehicles <span aria-hidden='true'>↗</span></Link></div>
    </div>
  </section>;
}
