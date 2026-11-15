import styles from './WorkspacePages.module.css';
export default function WorkspaceLoading() {
  return <main className={styles.page} aria-busy='true'><p role='status'>Loading your workspace…</p></main>;
}
