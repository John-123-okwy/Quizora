import { useState, useEffect } from 'react';
import styles from './SubjectForm.module.css';

const EMPTY_FORM = {
  name: '',
  code: '',
  numQuestions: '',
  timeLimitMinutes: '',
  resultsVisibility: 'immediate',
};

export default function SubjectForm({ onSubmit, editingSubject, onCancelEdit }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingSubject) {
      setForm({
        name: editingSubject.name,
        code: editingSubject.code,
        numQuestions: editingSubject.numQuestions,
        timeLimitMinutes: editingSubject.timeLimitMinutes,
        resultsVisibility: editingSubject.resultsVisibility || 'immediate',
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [editingSubject]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !form.code.trim()) {
      setError('Subject name and code are required.');
      return;
    }
    const numQ = Number(form.numQuestions);
    const timeLimit = Number(form.timeLimitMinutes);
    if (!numQ || numQ < 1) {
      setError('Number of questions must be at least 1.');
      return;
    }
    if (!timeLimit || timeLimit < 1) {
      setError('Time limit must be at least 1 minute.');
      return;
    }

    try {
      setSaving(true);
      await onSubmit(form, editingSubject?.id);
      setForm(EMPTY_FORM);
    } catch (err) {
      setError('Could not save subject. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3 className={styles.title}>
        {editingSubject ? 'Edit Subject' : 'Add New Subject'}
      </h3>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="name">Subject Name</label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="e.g. Chemistry"
            value={form.name}
            onChange={handleChange}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="code">Subject Code</label>
          <input
            id="code"
            name="code"
            type="text"
            placeholder="e.g. CHEM101"
            value={form.code}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="numQuestions">Number of Questions</label>
          <input
            id="numQuestions"
            name="numQuestions"
            type="number"
            min="1"
            value={form.numQuestions}
            onChange={handleChange}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="timeLimitMinutes">Time Limit (minutes)</label>
          <input
            id="timeLimitMinutes"
            name="timeLimitMinutes"
            type="number"
            min="1"
            value={form.timeLimitMinutes}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="resultsVisibility">Result Visibility</label>
        <select
          id="resultsVisibility"
          name="resultsVisibility"
          value={form.resultsVisibility}
          onChange={handleChange}
        >
          <option value="immediate">Show immediately after submission</option>
          <option value="locked">Locked until admin releases it</option>
        </select>
      </div>

      <div className={styles.actions}>
        <button className={styles.submitBtn} type="submit" disabled={saving}>
          {saving ? 'Saving...' : editingSubject ? 'Update Subject' : 'Add Subject'}
        </button>
        {editingSubject && (
          <button type="button" className={styles.cancelBtn} onClick={onCancelEdit}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}