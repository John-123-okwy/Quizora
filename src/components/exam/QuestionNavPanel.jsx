import styles from './QuestionNavPanel.module.css';

export default function QuestionNavPanel({ totalCount, currentIndex, answeredMap, onJumpTo }) {
  return (
    <div className={styles.panel}>
      <div className={styles.title}>Question Navigator</div>
      <div className={styles.grid}>
        {Array.from({ length: totalCount }, (_, i) => {
          const isAnswered = answeredMap[i];
          const isCurrent = i === currentIndex;
          return (
            <button
              key={i}
              className={`${styles.navBtn} ${isAnswered ? styles.answered : ''} ${isCurrent ? styles.current : ''}`}
              onClick={() => onJumpTo(i)}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ backgroundColor: 'var(--color-primary)' }} />
          Current question
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ backgroundColor: 'rgba(30, 158, 90, 0.15)' }} />
          Answered
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ backgroundColor: 'var(--color-bg)' }} />
          Unanswered
        </div>
      </div>
    </div>
  );
}