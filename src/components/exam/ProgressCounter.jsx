import styles from './ProgressCounter.module.css';

export default function ProgressCounter({ answeredCount, totalCount }) {
  const unanswered = totalCount - answeredCount;
  return (
    <div className={styles.counter}>
      <div className={styles.item}>
        <span className={`${styles.dot} ${styles.answeredDot}`} />
        Answered: {answeredCount}
      </div>
      <div className={styles.item}>
        <span className={`${styles.dot} ${styles.unansweredDot}`} />
        Unanswered: {unanswered}
      </div>
    </div>
  );
}