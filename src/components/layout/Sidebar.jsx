import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Sidebar.module.css';

export default function Sidebar({ isOpen, onClose }) {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const linkClass = ({ isActive }) =>
    isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink;

  return (
    <>
      {isOpen && <div className={styles.overlay} onClick={onClose} />}
      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.header}>
          <span>Menu</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close menu">
            ✕
          </button>
        </div>

        <nav className={styles.navList}>
          <NavLink to="/dashboard" className={linkClass} onClick={onClose}>
            Dashboard
          </NavLink>
          <NavLink to="/my-results" className={linkClass} onClick={onClose}>
            My Results
          </NavLink>
          {(userProfile?.role === 'admin' || userProfile?.role === 'chief') && (
            <NavLink to="/admin" className={linkClass} onClick={onClose}>
              Admin Panel
            </NavLink>
          )}
          <NavLink to="/settings" className={linkClass} onClick={onClose}>
            Settings
          </NavLink>
        </nav>

        <button className={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </aside>
    </>
  );
}