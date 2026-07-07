import Logo from '../../assets/logo.jsx';
import styles from './BrandHeader.module.css';

export default function BrandHeader({ size = 'default' }) {
  return (
    <div className={`${styles.brand} ${size === 'small' ? styles.small : ''}`}>
      <Logo size={size === 'small' ? 28 : 40} />
      <span className={styles.name}>Quizora</span>
    </div>
  );
}