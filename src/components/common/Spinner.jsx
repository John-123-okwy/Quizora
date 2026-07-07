import styles from './Spinner.module.css';

export default function Spinner({ label = 'Loading...', size = 'default' }) {
  return (
    <div className={styles.wrapper}>
      <div className={`${styles.spinner} ${size === 'small' ? styles.small : ''}`} />
      {label && <span className={styles.label}>{label}</span>}
    </div>
  );
}