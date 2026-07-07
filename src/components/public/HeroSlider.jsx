import { useState, useEffect } from 'react';
import styles from '../../pages/public/LandingPage.module.css';

export default function HeroSlider({ slides }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className={styles.sliderWrapper}>
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`${styles.slide} ${index === activeIndex ? styles.slideActive : ''}`}
        >
          <img src={slide.image} alt={slide.title} className={styles.slideImage} />
          <div className={styles.slideCaption}>
            <div className={styles.slideCaptionTitle}>{slide.title}</div>
            <div className={styles.slideCaptionText}>{slide.text}</div>
          </div>
        </div>
      ))}

      <div className={styles.sliderDots}>
        {slides.map((_, index) => (
          <button
            key={index}
            className={`${styles.sliderDot} ${index === activeIndex ? styles.sliderDotActive : ''}`}
            onClick={() => setActiveIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}