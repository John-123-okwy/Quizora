import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { parseFullName } from '../../utils/nameHelpers';
import BrandHeader from '../common/BrandHeader';
import styles from './Navbar.module.css';

export default function Navbar({ onToggleSidebar }) {
  const { userProfile } = useAuth();
  const { initials } = parseFullName(userProfile?.fullName || '');
  const navigate = useNavigate();
  const location = useLocation();

  const showBackButton = location.pathname !== '/dashboard';

  return (
    <header className={styles.navbar}>
      <div className={styles.left}>
        <button
          className={styles.hamburger}
          onClick={onToggleSidebar}
          aria-label="Toggle menu"
        >
          ☰
        </button>
        {showBackButton && (
          <button
            className={styles.backBtn}
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            ←
          </button>
        )}
        <BrandHeader size="small" />
      </div>

      <div className={styles.right}>
        <button
          className={styles.avatarBtn}
          onClick={() => navigate('/profile')}
          aria-label="Go to profile"
        >
          {userProfile?.photoURL ? (
            <img src={userProfile.photoURL} alt="Profile" className={styles.avatarImage} />
          ) : (
            <div className={styles.avatar}>{initials || '?'}</div>
          )}
        </button>
      </div>
    </header>
  );
}