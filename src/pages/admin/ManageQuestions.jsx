import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import QuestionForm from '../../components/admin/QuestionForm';
import BulkUploadForm from '../../components/admin/BulkUploadForm';
import QuestionTable from '../../components/admin/QuestionTable';
import ConfirmModal from '../../components/common/ConfirmModal';
import Spinner from '../../components/common/Spinner';
import { useAuth } from '../../contexts/AuthContext';
import { getAllSubjects } from '../../firebase/subjects.service';
import {
  getAllQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  bulkCreateQuestions,
} from '../../firebase/questions.service';
import styles from './ManageQuestions.module.css';

export default function ManageQuestions() {
  const { currentUser, userProfile } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('single');
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionToDelete, setQuestionToDelete] = useState(null);

  const actor = { uid: currentUser.uid, role: userProfile.role, fullName: userProfile.fullName, email: userProfile.email };

  const subjectsById = useMemo(
    () => subjects.reduce((acc, s) => ({ ...acc, [s.id]: s }), {}),
    [subjects]
  );

  const loadData = async () => {
    setLoading(true);
    const [subjectsData, questionsData] = await Promise.all([
      getAllSubjects(),
      getAllQuestions(),
    ]);
    setSubjects(subjectsData);
    setQuestions(questionsData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const questionCounts = useMemo(() => {
    const counts = {};
    questions.forEach((q) => {
      counts[q.subjectId] = (counts[q.subjectId] || 0) + 1;
    });
    return counts;
  }, [questions]);

  const handleSubmit = async (form, editingId) => {
    const subjectCode = subjectsById[form.subjectId]?.code;
    if (editingId) {
      await updateQuestion(editingId, {
        subjectId: form.subjectId,
        text: form.text.trim(),
        options: form.options.map((o) => o.trim()),
        correctIndex: Number(form.correctIndex),
        explanation: form.explanation.trim(),
        difficulty: form.difficulty,
      }, actor, subjectCode);
      setEditingQuestion(null);
    } else {
      await createQuestion({ ...form, createdBy: currentUser.uid, actor, subjectCode });
    }
    await loadData();
  };

  const handleBulkSubmit = async (parsedQuestions) => {
    await bulkCreateQuestions(parsedQuestions, currentUser.uid, actor);
    await loadData();
  };

  const handleDeleteConfirmed = async () => {
    const subjectCode = subjectsById[questionToDelete.subjectId]?.code;
    await deleteQuestion(questionToDelete.id, questionToDelete.text, actor, subjectCode);
    setQuestionToDelete(null);
    await loadData();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Spinner label="Loading questions..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Manage Questions</h1>
          <p>Add questions singly or in bulk, then sort and manage them below.</p>
        </div>

        {subjects.length === 0 ? (
          <div className={styles.noSubjects}>
            No subjects exist yet. Ask your Chief Admin to create a subject
            first before adding questions.
          </div>
        ) : (
          <>
            <div className={styles.statsBar}>
              {subjects.map((s) => {
                const count = questionCounts[s.id] || 0;
                const met = count >= s.numQuestions;
                return (
                  <div className={styles.statCard} key={s.id}>
                    <div className={styles.statSubject}>{s.name} ({s.code})</div>
                    <div className={styles.statCount}>{count}</div>
                    <div className={`${styles.statTarget} ${met ? styles.statMet : styles.statShort}`}>
                      {met ? 'Target met' : `Needs ${s.numQuestions - count} more`} · required {s.numQuestions}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${activeTab === 'single' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('single')}
              >
                Single Question
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'bulk' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('bulk')}
              >
                Bulk Upload
              </button>
            </div>

            {activeTab === 'single' ? (
              <QuestionForm
                subjects={subjects}
                onSubmit={handleSubmit}
                editingQuestion={editingQuestion}
                onCancelEdit={() => setEditingQuestion(null)}
              />
            ) : (
              <BulkUploadForm subjects={subjects} onBulkSubmit={handleBulkSubmit} />
            )}

            <QuestionTable
              questions={questions}
              subjects={subjects}
              onEdit={(q) => {
                setEditingQuestion(q);
                setActiveTab('single');
              }}
              onDelete={setQuestionToDelete}
            />
          </>
        )}
      </div>

      {questionToDelete && (
        <ConfirmModal
          title="Delete Question"
          message="Are you sure you want to delete this question? This cannot be undone."
          confirmLabel="Delete"
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setQuestionToDelete(null)}
        />
      )}
    </DashboardLayout>
  );
}