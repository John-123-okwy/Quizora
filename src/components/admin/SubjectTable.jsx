import styles from './SubjectTable.module.css';

export default function SubjectTable({ subjects, onEdit, onDelete, onToggleActive }) {
  if (subjects.length === 0) {
    return (
      <div className={styles.tableWrapper}>
        <p className={styles.empty}>No subjects added yet. Create one above.</p>
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Code</th>
            <th>Questions</th>
            <th>Time Limit</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((subject) => (
            <tr key={subject.id}>
              <td>{subject.name}</td>
              <td>{subject.code}</td>
              <td>{subject.numQuestions}</td>
              <td>{subject.timeLimitMinutes} min</td>
              <td>
                <span
                  className={`${styles.badge} ${
                    subject.isActive ? styles.badgeActive : styles.badgeInactive
                  }`}
                >
                  {subject.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>
                <div className={styles.actionsCell}>
                  <button
                    className={`${styles.iconBtn} ${styles.editBtn}`}
                    onClick={() => onEdit(subject)}
                  >
                    Edit
                  </button>
                  <button
                    className={`${styles.iconBtn} ${styles.toggleBtn}`}
                    onClick={() => onToggleActive(subject)}
                  >
                    {subject.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    className={`${styles.iconBtn} ${styles.deleteBtn}`}
                    onClick={() => onDelete(subject)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}