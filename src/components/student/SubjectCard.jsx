import { useNavigate } from 'react-router-dom';
import { useExamSession } from '../../contexts/ExamSessionContext';
import styles from './SubjectCard.module.css';

export default function SubjectCard({ subject, isSelected, onToggleSelect }) {
  const navigate = useNavigate();
  const { startSession } = useExamSession();

  const handleSingleStart = () => {
    navigate(`/subject/${subject.id}`);
  };

  return (
    <div className={`${styles.card} ${isSelected ? styles.cardSelected : ''}`}>
      <label className={styles.checkboxRow}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(subject.id)}
        />
        Select for combined exam
      </label>

      <div className={styles.header}>
        <div>
          <h3 className={styles.name}>{subject.name}</h3>
        </div>
        <span className={styles.code}>{subject.code}</span>
      </div>

      <div className={styles.meta}>
        <div className={styles.metaItem}>
          <span>Questions</span>
          <span className={styles.metaValue}>{subject.numQuestions}</span>
        </div>
        <div className={styles.metaItem}>
          <span>Duration</span>
          <span className={styles.metaValue}>{subject.timeLimitMinutes} min</span>
        </div>
      </div>

      <button className={styles.proceedBtn} onClick={handleSingleStart}>
        Proceed to Exam
      </button>
    </div>
  );
}