import { useState, useMemo } from 'react';
import styles from './QuestionTable.module.css';

export default function QuestionTable({ questions, subjects, onEdit, onDelete }) {
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const subjectsById = useMemo(
    () => subjects.reduce((acc, s) => ({ ...acc, [s.id]: s }), {}),
    [subjects]
  );

  const filtered = useMemo(() => {
    return questions.filter((q) => {
      const subjectMatch = subjectFilter === 'all' || q.subjectId === subjectFilter;
      const difficultyMatch = difficultyFilter === 'all' || q.difficulty === difficultyFilter;
      const searchMatch =
        !searchTerm.trim() || q.text.toLowerCase().includes(searchTerm.trim().toLowerCase());
      return subjectMatch && difficultyMatch && searchMatch;
    });
  }, [questions, subjectFilter, difficultyFilter, searchTerm]);

  return (
    <div>
      <div className={styles.filters}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search question text..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
          <option value="all">All Subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <select value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)}>
          <option value="all">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      <div className={styles.resultsCount}>
        Showing {filtered.length} of {questions.length} question(s)
      </div>

      {filtered.length === 0 ? (
        <div className={styles.tableWrapper}>
          <p className={styles.empty}>
            {questions.length === 0 ? 'No questions added yet.' : 'No questions match your search or filters.'}
          </p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Question</th>
                <th>Difficulty</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((q) => (
                <tr key={q.id}>
                  <td>{subjectsById[q.subjectId]?.code || 'Unknown'}</td>
                  <td className={styles.questionCell}>
                    {q.text.length > 80 ? `${q.text.slice(0, 80)}...` : q.text}
                  </td>
                  <td>
                    <span className={`${styles.badge} ${styles[q.difficulty] || styles.medium}`}>
                      {q.difficulty}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionsCell}>
                      <button className={`${styles.iconBtn} ${styles.editBtn}`} onClick={() => onEdit(q)}>
                        Edit
                      </button>
                      <button className={`${styles.iconBtn} ${styles.deleteBtn}`} onClick={() => onDelete(q)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}