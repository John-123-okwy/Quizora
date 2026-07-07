import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useExamSession } from '../../contexts/ExamSessionContext';
import { getSubjectById } from '../../firebase/subjects.service';
import styles from './SessionConfirm.module.css';

export default function SessionConfirm() {
  const location = useLocation();
  const navigate = useNavigate();
  const { startSession } = useExamSession();

  const subjectIds = location.state?.subjectIds || [];
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (subjectIds.length === 0) {
      navigate('/dashboard', { replace: true });
      return;
    }
    Promise.all(subjectIds.map((id) => getSubjectById(id))).then((data) => {
      setSubjects(data.filter(Boolean));
      setLoading(false);
    });
  }, [subjectIds, navigate]);

  const handleBegin = () => {
    startSession(subjects.map((s) => s.id));
    navigate(`/exam/${subjects[0].id}`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <p style={{ padding: '2rem', textAlign: 'center' }}>Loading...</p>
      </DashboardLayout>
    );
  }

  const totalQuestions = subjects.reduce((sum, s) => sum + s.numQuestions, 0);
  const totalMinutes = subjects.reduce((sum, s) => sum + s.timeLimitMinutes, 0);

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <div className={styles.card}>
          <h1>Confirm Your Exam Session</h1>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            You'll take these subjects one after another, in this order:
          </p>

          {subjects.map((s, idx) => (
            <div className={styles.subjectRow} key={s.id}>
              <span>{idx + 1}. {s.name} ({s.code})</span>
              <span>{s.numQuestions} questions · {s.timeLimitMinutes} min</span>
            </div>
          ))}

          <div className={styles.totalsRow}>
            <span>Total</span>
            <span>{totalQuestions} questions · {totalMinutes} min</span>
          </div>

          <div className={styles.instructions}>
            Each subject has its own timer. When you submit a subject (or its
            time runs out), you'll automatically move to the next one. Your
            final combined result appears after the last subject.
          </div>

          <button className={styles.beginBtn} onClick={handleBegin}>
            Begin Exam Session
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}