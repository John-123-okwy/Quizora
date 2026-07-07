import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
  const { userProfile } = useAuth();
  const isChief = userProfile?.role === 'chief';

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <h1>Admin Dashboard</h1>
        <p>Welcome, {userProfile?.fullName}.</p>
        <span className={styles.roleTag}>{userProfile?.role} </span>

        <div className={styles.grid}>
          {isChief && (
            <Link to="/admin/subjects" className={styles.card}>
              <h3>Manage Subjects</h3>
              <p>Create, edit, and set question count, time limit & result visibility.</p>
            </Link>
          )}
          <Link to="/admin/questions" className={styles.card}>
            <h3>Manage Questions</h3>
            <p>Add, edit, delete, and bulk upload questions by subject.</p>
          </Link>
          <Link to="/admin/results" className={styles.card}>
            <h3>Manage Results</h3>
            <p>Release, lock, or clear student results, per subject or per student.</p>
          </Link>
          {isChief && (
            <Link to="/admin/users" className={styles.card}>
              <h3>Manage Users</h3>
              <p>View all users, promote to admin, or demote back to student.</p>
            </Link>
          )}
          <Link to="/admin/activity" className={styles.card}>
            <h3>Activity Logs</h3>
            <p>Monitor user and admin activity across the system.</p>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}