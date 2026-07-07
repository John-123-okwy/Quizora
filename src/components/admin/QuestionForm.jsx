import { useState, useEffect } from 'react';
import styles from './QuestionForm.module.css';

const EMPTY_FORM = {
  subjectId: '',
  text: '',
  options: ['', '', '', ''],
  correctIndex: 0,
  explanation: '',
  difficulty: 'medium',
};

export default function QuestionForm({ subjects, onSubmit, editingQuestion, onCancelEdit }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingQuestion) {
      setForm({
        subjectId: editingQuestion.subjectId,
        text: editingQuestion.text,
        options: [...editingQuestion.options],
        correctIndex: editingQuestion.correctIndex,
        explanation: editingQuestion.explanation || '',
        difficulty: editingQuestion.difficulty || 'medium',
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [editingQuestion]);

  const handleOptionChange = (index, value) => {
    const newOptions = [...form.options];
    newOptions[index] = value;
    setForm({ ...form, options: newOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.subjectId) {
      setError('Please select a subject.');
      return;
    }
    if (!form.text.trim()) {
      setError('Question text is required.');
      return;
    }
    if (form.options.some((o) => !o.trim())) {
      setError('All 4 options must be filled in.');
      return;
    }
    if (!form.explanation.trim()) {
      setError('Explanation is required (shown during answer review).');
      return;
    }

    try {
      setSaving(true);
      await onSubmit(form, editingQuestion?.id);
      setForm(EMPTY_FORM);
    } catch (err) {
      setError('Could not save question. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3 className={styles.title}>
        {editingQuestion ? 'Edit Question' : 'Add New Question'}
      </h3>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="subjectId">Subject</label>
          <select
            id="subjectId"
            value={form.subjectId}
            onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
          >
            <option value="">Select subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="difficulty">Difficulty</label>
          <select
            id="difficulty"
            value={form.difficulty}
            onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="text">Question Text</label>
        <textarea
          id="text"
          value={form.text}
          onChange={(e) => setForm({ ...form, text: e.target.value })}
          placeholder="Type the question here..."
        />
      </div>

      <label className={styles.optionsLabel}>
        Options (select the radio button next to the correct answer)
      </label>
      {form.options.map((opt, idx) => (
        <div className={styles.optionRow} key={idx}>
          <input
            type="radio"
            name="correctIndex"
            checked={form.correctIndex === idx}
            onChange={() => setForm({ ...form, correctIndex: idx })}
          />
          <input
            type="text"
            placeholder={`Option ${idx + 1}`}
            value={opt}
            onChange={(e) => handleOptionChange(idx, e.target.value)}
          />
        </div>
      ))}
      <p className={styles.hint}>The selected radio marks the correct answer.</p>

      <div className={styles.field}>
        <label htmlFor="explanation">Explanation</label>
        <textarea
          id="explanation"
          value={form.explanation}
          onChange={(e) => setForm({ ...form, explanation: e.target.value })}
          placeholder="Why is this the correct answer? (shown in answer review)"
        />
      </div>

      <div className={styles.actions}>
        <button className={styles.submitBtn} type="submit" disabled={saving}>
          {saving ? 'Saving...' : editingQuestion ? 'Update Question' : 'Add Question'}
        </button>
        {editingQuestion && (
          <button type="button" className={styles.cancelBtn} onClick={onCancelEdit}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}