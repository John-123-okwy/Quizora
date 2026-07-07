import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { getResultsByUser } from '../../firebase/results.service';
import { formatFirestoreTimestamp } from '../../utils/formatDate';
import styles from './MyResults.module.css';

export default function MyResults() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getResultsByUser(currentUser.uid).then((data) => {
      setResults(data);
      setLoading(false);
    });
  }, [currentUser]);

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>My Results</h1>
          <p>All your past exam attempts. Locked results become viewable here once released.</p>
        </div>

        {loading ? (
          <p className={styles.loading}>Loading...</p>
        ) : results.length === 0 ? (
          <div className={styles.tableWrapper}>
            <p className={styles.empty}>You haven't taken any exams yet.</p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Submitted</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.id}>
                    <td>{r.subjectName}</td>
                    <td>{formatFirestoreTimestamp(r.submittedAt)}</td>
                    <td>{r.resultVisible ? `${r.score}/${r.totalQuestions}` : '—'}</td>
                    <td>
                      <span className={`${styles.badge} ${r.resultVisible ? styles.visible : styles.hidden}`}>
                        {r.resultVisible ? 'Available' : 'Locked'}
                      </span>
                    </td>
                    <td>
                      <button className={styles.viewBtn} onClick={() => navigate(`/result/${r.id}`)}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}