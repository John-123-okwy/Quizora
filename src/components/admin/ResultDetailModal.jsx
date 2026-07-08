import { formatFirestoreTimestamp } from '../../utils/formatDate';
import { formatSecondsToMMSS } from '../../utils/formatTime';
import styles from './ResultDetailModal.module.css';

export default function ResultDetailModal({ result, onClose }) {
  const LETTERS = ['A', 'B', 'C', 'D'];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.headerRow}>
          <h2>{result.userFullName} — {result.subjectName}</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.metaGrid}>
          <div className={styles.metaItem}>
            <div className={styles.metaLabel}>Score</div>
            <div className={styles.metaValue}>{result.score}/{result.totalQuestions}</div>
          </div>
          <div className={styles.metaItem}>
            <div className={styles.metaLabel}>Time Used</div>
            <div className={styles.metaValue}>{formatSecondsToMMSS(result.timeTakenSeconds)}</div>
          </div>
          <div className={styles.metaItem}>
            <div className={styles.metaLabel}>Submitted At</div>
            <div className={styles.metaValue}>{formatFirestoreTimestamp(result.submittedAt)}</div>
          </div>
          <div className={styles.metaItem}>
            <div className={styles.metaLabel}>Visibility to Student</div>
            <div className={styles.metaValue}>{result.resultVisible ? 'Visible' : 'Locked'}</div>
          </div>
        </div>

        {result.tabSwitchCount > 0 && (
          <div className={styles.violationsList}>
            <div className={styles.violationsTitle}>
              ⚠ {result.tabSwitchCount} Tab Switch Violation{result.tabSwitchCount > 1 ? 's' : ''} Detected
            </div>
            {(result.tabSwitchViolations || []).map((timestamp, idx) => (
              <div className={styles.violationTime} key={idx}>
                Switch #{idx + 1}: {new Date(timestamp).toLocaleTimeString('en-US')}
              </div>
            ))}
          </div>
        )}

        {result.answers.map((ans, idx) => (
          <div className={styles.questionBlock} key={ans.questionId}>
            <div className={styles.qHeader}>
              <span>Question {idx + 1}</span>
              <span className={ans.isCorrect ? styles.correctText : styles.incorrectText}>
                {ans.isCorrect ? 'Correct' : 'Incorrect'}
              </span>
            </div>
            <div className={styles.qText}>{ans.questionText}</div>
            {ans.options.map((opt, optIdx) => {
              const isCorrectOpt = optIdx === ans.correctIndex;
              const isSelected = optIdx === ans.selectedIndex;
              return (
                <div
                  key={optIdx}
                  className={`${styles.optionRow} ${isCorrectOpt ? styles.optCorrect : ''} ${isSelected && !isCorrectOpt ? styles.optWrong : ''}`}
                >
                  {LETTERS[optIdx]}. {opt}
                  {isCorrectOpt ? ' ✓ Correct Answer' : ''}
                  {isSelected && !isCorrectOpt ? ' ← Student\u2019s Answer' : ''}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}