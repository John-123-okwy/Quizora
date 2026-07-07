import { useState } from 'react';
import { parseQuestionsCSV } from '../../utils/csvParser';
import styles from './BulkUploadForm.module.css';

export default function BulkUploadForm({ subjects, onBulkSubmit }) {
  const [preview, setPreview] = useState([]);
  const [errors, setErrors] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState('');

  const subjectsByCode = subjects.reduce((acc, s) => {
    acc[s.code] = s;
    return acc;
  }, {});

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSuccess('');
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const { parsed, errors: parseErrors } = parseQuestionsCSV(evt.target.result, subjectsByCode);
        setPreview(parsed);
        setErrors(parseErrors);
      } catch (err) {
        setErrors([err.message]);
        setPreview([]);
      }
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (preview.length === 0) return;
    setUploading(true);
    try {
      await onBulkSubmit(preview);
      setSuccess(`Successfully uploaded ${preview.length} questions.`);
      setPreview([]);
      setErrors([]);
    } catch (err) {
      setErrors(['Upload failed. Please try again.']);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.form}>
      <h3 className={styles.title}>Bulk Upload Questions (CSV)</h3>
      <p className={styles.instructions}>
        Upload a CSV file with these columns in order (no header changes needed, just data rows below the header):
      </p>
      <code className={styles.code}>
        subjectCode,question,option1,option2,option3,option4,correctIndex,explanation,difficulty
      </code>
      <p className={styles.instructions}>
        subjectCode must match an existing subject's code exactly (e.g. CHEM101).
        correctIndex is 0-based (0 = option1). difficulty is easy/medium/hard (optional, defaults to medium).
      </p>

      <input
        className={styles.fileInput}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
      />

      {errors.length > 0 && (
        <div className={styles.errorList}>
          {errors.map((err, i) => (
            <div key={i}>{err}</div>
          ))}
        </div>
      )}

      {preview.length > 0 && (
        <div className={styles.previewBox}>
          <strong>{preview.length} question(s) ready to upload:</strong>
          {preview.slice(0, 5).map((q, i) => (
            <div key={i} style={{ marginTop: '0.5rem' }}>
              {i + 1}. {q.text.slice(0, 60)}{q.text.length > 60 ? '...' : ''}
            </div>
          ))}
          {preview.length > 5 && <div>...and {preview.length - 5} more</div>}
        </div>
      )}

      {success && <p className={styles.success}>{success}</p>}

      <button
        className={styles.submitBtn}
        onClick={handleUpload}
        disabled={preview.length === 0 || uploading}
      >
        {uploading ? 'Uploading...' : `Upload ${preview.length || ''} Questions`}
      </button>
    </div>
  );
}