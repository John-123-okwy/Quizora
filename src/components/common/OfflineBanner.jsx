import { useState, useEffect } from 'react';
import styles from './OfflineBanner.module.css';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
      setShowReconnected(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3000);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (isOffline) {
    return (
      <div className={`${styles.banner} ${styles.offline}`}>
        ⚠ You're offline. Some features may not work until your connection is restored.
      </div>
    );
  }

  if (showReconnected) {
    return (
      <div className={`${styles.banner} ${styles.online}`}>
        ✓ You're back online.
      </div>
    );
  }

  return null;
}