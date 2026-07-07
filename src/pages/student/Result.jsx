import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getResultById } from '../../firebase/results.service';
import { formatSecondsToMMSS } from '../../utils/formatTime';
import styles from './Result.module.css';

export default function Result() {
  const { resultId } = useParams();
  const navigate = useNavigate();
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
        <p style={{ padding: '2rem', textAlign: 'center' }}>Loading result...</p>
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
          <div className={styles.card}>
            <h1>Exam Submitted</h1>
            <p className={styles.subjectName}>{result.subjectName}</p>
            <div className={styles.lockedBox}>
              <div className={styles.lockedIcon}>🔒</div>
              <p>
                Your submission was received successfully. Your result and
                score will be available once your administrator releases it.
              </p>
            </div>
            <button className={styles.dashboardBtn} onClick={() => navigate('/dashboard')} style={{ width: '100%' }}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const percentage = Math.round((result.score / result.totalQuestions) * 100);
  const incorrect = result.totalQuestions - result.score;

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <div className={styles.card}>
          <h1>Exam Completed</h1>
          <p className={styles.subjectName}>{result.subjectName}</p>

          <div className={styles.scoreCircle}>
            <span className={styles.scoreValue}>{percentage}%</span>
            <span className={styles.scoreLabel}>Score</span>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statBox}>
              <div className={styles.statBoxValue}>{result.score}</div>
              <div className={styles.statBoxLabel}>Correct</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statBoxValue}>{incorrect}</div>
              <div className={styles.statBoxLabel}>Incorrect</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statBoxValue}>{formatSecondsToMMSS(result.timeTakenSeconds)}</div>
              <div className={styles.statBoxLabel}>Time Taken</div>
            </div>
          </div>

          <div className={styles.actions}>
            <button className={styles.dashboardBtn} onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </button>
            <button className={styles.reviewBtn} onClick={() => navigate(`/review/${result.id}`)}>
              Review Answers
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}