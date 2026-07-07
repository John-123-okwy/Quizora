import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import SubjectCard from '../../components/student/SubjectCard';
import { useAuth } from '../../contexts/AuthContext';
import { getActiveSubjects } from '../../firebase/subjects.service';
import { parseFullName, getTimeBasedGreeting } from '../../utils/nameHelpers';
import styles from './Dashboard.module.css';
import Spinner from '../../components/common/Spinner';

export default function Dashboard() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const { firstName } = parseFullName(userProfile?.fullName || '');
  const greeting = getTimeBasedGreeting();

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    getActiveSubjects()
      .then(setSubjects)
      .finally(() => setLoading(false));
  }, []);

  const toggleSelect = (subjectId) => {
    setSelectedIds((prev) =>
      prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId]
    );
  };

  const selectedSubjects = subjects.filter((s) => selectedIds.includes(s.id));
  const totalQuestions = selectedSubjects.reduce((sum, s) => sum + s.numQuestions, 0);
  const totalMinutes = selectedSubjects.reduce((sum, s) => sum + s.timeLimitMinutes, 0);

  const handleStartSelected = () => {
    navigate('/session/confirm', { state: { subjectIds: selectedIds } });
  };

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <h1 className={styles.greeting}>
          Hello, {firstName || 'there'}! {greeting.charAt(0).toUpperCase() + greeting.slice(1)}.
        </h1>
        <p className={styles.subtext}>
          Here are the subjects available for you. Select more than one to take a combined exam session.
        </p>

        {loading ? (
          <p className={styles.loading}>Loading subjects...  <Spinner/></p>
        ) : subjects.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No exams are available right now. Check back later.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {subjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                isSelected={selectedIds.includes(subject.id)}
                onToggleSelect={toggleSelect}
              />
            ))}
          </div>
        )}
      </div>

      {selectedIds.length >= 2 && (
        <div className={styles.selectionBar}>
          <div>
            <div className={styles.selectionText}>{selectedIds.length} subjects selected</div>
            <div className={styles.selectionSubtext}>
              {totalQuestions} questions · {totalMinutes} min total
            </div>
          </div>
          <button className={styles.startSelectedBtn} onClick={handleStartSelected}>
            Start Combined Exam
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}