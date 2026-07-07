import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getSubjectById } from '../../firebase/subjects.service';
import { useExamSession } from '../../contexts/ExamSessionContext';
import styles from './SubjectDetails.module.css';

export default function SubjectDetails() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { startSession } = useExamSession();
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSubjectById(subjectId)
      .then(setSubject)
      .finally(() => setLoading(false));
  }, [subjectId]);

  const handleStart = () => {
    startSession([subject.id]);
    navigate(`/exam/${subject.id}`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className={styles.container}>
          <p className={styles.notFound}>Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!subject) {
    return (
      <DashboardLayout>
        <div className={styles.container}>
          <p className={styles.notFound}>Subject not found.</p>
          <Link to="/dashboard" className={styles.backLink}>← Back to Dashboard</Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <Link to="/dashboard" className={styles.backLink}>← Back to Dashboard</Link>

        <div className={styles.card}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.name}>{subject.name}</h1>
              <span className={styles.code}>{subject.code}</span>
            </div>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statBox}>
              <div className={styles.statValue}>{subject.numQuestions}</div>
              <div className={styles.statLabel}>Questions</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statValue}>{subject.timeLimitMinutes}</div>
              <div className={styles.statLabel}>Minutes</div>
            </div>
          </div>

          <div className={styles.instructions}>
            Once you click Start, the timer begins immediately and cannot be
            paused. Answer as many questions as you can — you may move between
            questions freely and jump to any question using the navigation
            panel. The exam auto-submits when time runs out.
          </div>

          <button className={styles.startBtn} onClick={handleStart}>
            Start Exam
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}