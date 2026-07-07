import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getResultById } from '../../firebase/results.service';
import styles from './ReviewAnswers.module.css';

export default function ReviewAnswers() {
  const { resultId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getResultById(resultId).then((data) => {
      setResult(data);
      setLoading(false);
    });
  }, [resultId]);

  if (loading) {
    return (
      <DashboardLayout>
        <p style={{ padding: '2rem', textAlign: 'center' }}>Loading review...</p>
      </DashboardLayout>
    );
  }

  if (!result) {
    return (
      <DashboardLayout>
        <p style={{ padding: '2rem', textAlign: 'center' }}>Result not found.</p>
      </DashboardLayout>
    );
  }

  if (!result.resultVisible) {
    return (
      <DashboardLayout>
        <div className={styles.container}>
          <Link to="/dashboard" className={styles.backLink}>← Back to Dashboard</Link>
          <div className={styles.lockedBox}>
            🔒 Answer review is locked until your administrator releases results for this exam.
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const LETTERS = ['A', 'B', 'C', 'D'];

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <Link to={`/result/${result.id}`} className={styles.backLink}>← Back to Result</Link>

        <div className={styles.summaryCard}>
          <div>
            <div>{result.subjectName}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Full breakdown with explanations
            </div>
          </div>
          <div className={styles.summaryScore}>
            {result.score}/{result.totalQuestions}
          </div>
        </div>

        {result.answers.map((ans, idx) => (
          <div className={styles.questionBlock} key={ans.questionId}>
            <div className={styles.questionHeader}>
              <span className={styles.questionNumber}>Question {idx + 1}</span>
              <span className={`${styles.resultBadge} ${ans.isCorrect ? styles.correctBadge : styles.incorrectBadge}`}>
                {ans.isCorrect ? 'Correct' : 'Incorrect'}
              </span>
            </div>

            <div className={styles.questionText}>{ans.questionText}</div>

            <div className={styles.options}>
              {ans.options.map((opt, optIdx) => {
                const isCorrectOption = optIdx === ans.correctIndex;
                const isUserSelected = optIdx === ans.selectedIndex;
                const isWrongSelected = isUserSelected && !isCorrectOption;

                return (
                  <div
                    key={optIdx}
                    className={`${styles.option} ${isCorrectOption ? styles.optionCorrect : ''} ${isWrongSelected ? styles.optionWrongSelected : ''}`}
                  >
                    <strong>{LETTERS[optIdx]}.</strong> {opt}
                    {isCorrectOption && <span className={`${styles.tag} ${styles.tagCorrect}`}>Correct Answer</span>}
                    {isWrongSelected && <span className={`${styles.tag} ${styles.tagYourAnswer}`}>Your Answer</span>}
                  </div>
                );
              })}
            </div>

            {ans.explanation && (
              <div className={styles.explanation}>
                <strong>Explanation: </strong>
                {ans.explanation}
              </div>
            )}
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}