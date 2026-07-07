import styles from './QuestionCard.module.css';

const LETTERS = ['A', 'B', 'C', 'D'];

export default function QuestionCard({ question, questionNumber, totalCount, selectedIndex, onSelect }) {
  return (
    <div className={styles.card}>
      <div className={styles.questionNumber}>
        Question {questionNumber} of {totalCount}
      </div>
      <div className={styles.questionText}>{question.text}</div>

      <div className={styles.options}>
        {question.options.map((option, idx) => (
          <button
            key={idx}
            className={`${styles.option} ${selectedIndex === idx ? styles.optionSelected : ''}`}
            onClick={() => onSelect(idx)}
          >
            <span className={styles.optionLetter}>{LETTERS[idx]}</span>
            <span>{option}</span>
          </button>
        ))}
      </div>
    </div>
  );
}