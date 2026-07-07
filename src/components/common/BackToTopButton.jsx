import { useState, useEffect } from 'react';
import styles from './BackToTopButton.module.css';

export default function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      className={`${styles.button} ${visible ? styles.visible : ''}`}
      onClick={scrollToTop}
      aria-label="Back to top"
    >
      ↑
    </button>
  );
}