import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Onboarding.module.css';
import { BookAIcon, ChartColumnIncreasing, Clock3 } from 'lucide-react';

const STEPS = [
  {
    icon: <BookAIcon size={50} color='blue'/>,
    title: 'Choose Your Subjects',
    text: 'Browse the subjects made available by your school. Select one, or several for a combined exam session.',
  },
  {
    icon: <Clock3 size={50} color='blue'/>,
    title: 'Take Your Exam',
    text: 'Answer questions at your own pace within the time limit. Jump between questions freely using the navigator, and track your progress live.',
  },
  {
    icon: <ChartColumnIncreasing size={50} color='blue'/>,
    title: 'Review Your Results',
    text: 'See your score instantly, or once your administrator releases it. Review each answer with full explanations to learn from your mistakes.',
  },
];

const STORAGE_KEY = 'quizora-onboarding-seen';

export default function Onboarding() {
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    navigate('/dashboard', { replace: true });
  };

  const handleNext = () => {
    if (stepIndex === STEPS.length - 1) {
      finish();
    } else {
      setStepIndex((prev) => prev + 1);
    }
  };

  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.stepIcon}>{step.icon}</div>
        <h2 className={styles.stepTitle}>{step.title}</h2>
        <p className={styles.stepText}>{step.text}</p>

        <div className={styles.dots}>
          {STEPS.map((_, i) => (
            <span key={i} className={`${styles.dot} ${i === stepIndex ? styles.dotActive : ''}`} />
          ))}
        </div>

        <div className={styles.actions}>
          <button className={styles.skipBtn} onClick={finish}>
            Skip
          </button>
          <button className={styles.nextBtn} onClick={handleNext}>
            {isLast ? "Let's Go" : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function hasSeenOnboarding() {
  return localStorage.getItem(STORAGE_KEY) === 'true';
}