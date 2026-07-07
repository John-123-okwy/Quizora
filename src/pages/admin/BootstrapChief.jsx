import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { checkChiefExists, promoteSelfToChief } from '../../firebase/firestore.service';
import styles from './BootstrapChief.module.css';

export default function BootstrapChief() {
  const { currentUser, userProfile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [chiefExists, setChiefExists] = useState(null); // null = loading
  const [promoting, setPromoting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkChiefExists().then(setChiefExists).catch(() => setChiefExists(true));
  }, []);

  const handlePromote = async () => {
    setError('');
    try {
      setPromoting(true);
      await promoteSelfToChief(currentUser.uid);
      await refreshProfile();
      setDone(true);
    } catch (err) {
      setError('Something went wrong. Make sure the system/appConfig document exists.');
    } finally {
      setPromoting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <h1 className={styles.title}>Not logged in</h1>
          <p className={styles.text}>You need to log in first before becoming chief admin.</p>
        </div>
      </div>
    );
  }

  if (chiefExists === null) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <p>Checking system status...</p>
        </div>
      </div>
    );
  }

  if (userProfile?.role === 'chief' || done) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <h1 className={styles.title}>You're the Chief Admin</h1>
          <p className={styles.success}>Setup complete. Head to your admin dashboard.</p>
          <button className={styles.btn} style={{ marginTop: '1rem' }} onClick={() => navigate('/admin')}>
            Go to Admin Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (chiefExists) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <h1 className={styles.title}>Already Set Up</h1>
          <p className={styles.text}>
            A Chief Admin has already been assigned for Quizora. If you believe
            this is an error, contact your existing chief admin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>Become Chief Admin</h1>
        <p className={styles.text}>
          No chief admin exists yet for Quizora. As the first person to reach
          this page, you can claim the Chief Admin role. This can only be done
          once.
        </p>
        {error && <p style={{ color: 'var(--color-danger)', marginBottom: '1rem' }}>{error}</p>}
        <button className={styles.btn} onClick={handlePromote} disabled={promoting}>
          {promoting ? 'Setting up...' : 'Claim Chief Admin Role'}
        </button>
      </div>
    </div>
  );
}