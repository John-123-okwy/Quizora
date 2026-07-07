import { formatSecondsToMMSS } from '../../utils/formatTime';
import styles from './Timer.module.css';

export default function Timer({ secondsLeft }) {
  const isDanger = secondsLeft <= 60;
  const isWarning = secondsLeft <= 300 && secondsLeft > 60;

  return (
    <div
      className={`${styles.timer} ${isDanger ? styles.danger : ''} ${isWarning ? styles.warning : ''}`}
    >
      ⏱ {formatSecondsToMMSS(secondsLeft)}
    </div>
  );
}