import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import { useAuth } from '../../contexts/AuthContext';
import { getAllActivityLogs } from '../../firebase/activityLog.service';
import { formatFirestoreTimestamp } from '../../utils/formatDate';
import styles from './ActivityLogs.module.css';

export default function ActivityLogs() {
  const { currentUser, userProfile } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllActivityLogs().then((data) => {
      setLogs(data);
      setLoading(false);
    });
  }, []);

  const isChief = userProfile.role === 'chief';

  const visibleLogs = useMemo(() => {
    if (isChief) return logs;
    return logs.filter((l) => l.actorRole === 'user' || l.actorId === currentUser.uid);
  }, [logs, isChief, currentUser]);

  const roleTagClass = (role) => {
    if (role === 'chief') return styles.roleChief;
    if (role === 'admin') return styles.roleAdmin;
    return styles.roleUser;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Spinner label="Loading activity..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Activity Logs</h1>
          <p>
            {isChief
              ? 'Full activity across all users and admins.'
              : 'Student activity and your own actions.'}
          </p>
        </div>

        {visibleLogs.length === 0 ? (
          <div className={styles.tableWrapper}>
            <p className={styles.empty}>No activity recorded yet.</p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Details</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {visibleLogs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <div>{log.actorName}</div>
                      {log.actorEmail && <div className={styles.emailText}>{log.actorEmail}</div>}
                    </td>
                    <td>
                      <span className={`${styles.roleTag} ${roleTagClass(log.actorRole)}`}>
                        {log.actorRole}
                      </span>
                    </td>
                    <td>{log.action}</td>
                    <td className={styles.detailsText}>{log.details || '—'}</td>
                    <td>{formatFirestoreTimestamp(log.timestamp)}</td>
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