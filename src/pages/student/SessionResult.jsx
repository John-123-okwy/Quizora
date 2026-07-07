import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useExamSession } from '../../contexts/ExamSessionContext';
import { getResultById } from '../../firebase/results.service';
import styles from './SessionResult.module.css';

export default function SessionResult() {
  const { session, clearSession } = useExamSession();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResults() {
      const entries = Object.entries(session.resultIds);
      const data = await Promise.all(entries.map(([, resultId]) => getResultById(resultId)));
      setResults(data.filter(Boolean));
      setLoading(false);
    }
    if (session.subjectIds.length > 0) {
      loadResults();
    } else {
      setLoading(false);
    }
  }, [session]);

  const handleDone = () => {
    clearSession();
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <p style={{ padding: '2rem', textAlign: 'center' }}>Loading session results...</p>
      </DashboardLayout>
    );
  }

  if (results.length === 0) {
    return (
      <DashboardLayout>
        <div className={styles.container}>
          <p style={{ textAlign: 'center' }}>No session results found.</p>
          <button className={styles.dashboardBtn} onClick={handleDone}>Back to Dashboard</button>
        </div>
      </DashboardLayout>
    );
  }

  const visibleResults = results.filter((r) => r.resultVisible);
  const totalScore = visibleResults.reduce((sum, r) => sum + r.score, 0);
  const totalQuestions = visibleResults.reduce((sum, r) => sum + r.totalQuestions, 0);

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <div className={styles.card}>
          <h1>Exam Session Complete</h1>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
            Here's how you did across all {results.length} subjects.
          </p>

          {visibleResults.length > 0 && (
            <div className={styles.aggregateBox}>
              <div className={styles.aggregateScore}>
                {totalScore}/{totalQuestions}
              </div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                Combined score (visible subjects only)
              </div>
            </div>
          )}

          {results.map((r) => (
            <div className={styles.subjectRow} key={r.id}>
              <div className={styles.subjectInfo}>
                <div>{r.subjectName}</div>
                {!r.resultVisible && <div className={styles.lockedTag}>🔒 Locked by admin</div>}
              </div>
              {r.resultVisible ? (
                <div className={styles.actionLinks}>
                  <span className={styles.subjectScore}>{r.score}/{r.totalQuestions}</span>
                  <button className={styles.linkBtn} onClick={() => navigate(`/review/${r.id}`)}>
                    Review
                  </button>
                </div>
              ) : (
                <span className={styles.lockedTag}>Pending release</span>
              )}
            </div>
          ))}

          <button className={styles.dashboardBtn} onClick={handleDone}>
            Back to Dashboard
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}