import { useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import styles from './UpdateBanner.module.css';

export default function UpdateBanner() {
  const [dismissed, setDismissed] = useState(false);

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      // Check for updates every 60 minutes while the app is open
      if (registration) {
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      }
    },
  });

  if (!needRefresh || dismissed) return null;

  return (
    <div className={styles.banner}>
      <span className={styles.text}>A new version of Quizora is available.</span>
      <button className={styles.refreshBtn} onClick={() => updateServiceWorker(true)}>
        Refresh
      </button>
      <button className={styles.dismissBtn} onClick={() => setDismissed(true)} aria-label="Dismiss">
        ✕
      </button>
    </div>
  );
}