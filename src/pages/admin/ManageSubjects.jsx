import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import SubjectForm from '../../components/admin/SubjectForm';
import SubjectTable from '../../components/admin/SubjectTable';
import ConfirmModal from '../../components/common/ConfirmModal';
import Spinner from '../../components/common/Spinner';
import { useAuth } from '../../contexts/AuthContext';
import {
  getAllSubjects,
  createSubject,
  updateSubject,
  toggleSubjectActive,
  deleteSubject,
} from '../../firebase/subjects.service';
import styles from './ManageSubjects.module.css';

export default function ManageSubjects() {
  const { currentUser, userProfile } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectToDelete, setSubjectToDelete] = useState(null);

  const actor = { uid: currentUser.uid, role: userProfile.role, fullName: userProfile.fullName, email: userProfile.email };

  const loadSubjects = async () => {
    setLoading(true);
    const data = await getAllSubjects();
    setSubjects(data);
    setLoading(false);
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  const handleSubmit = async (form, editingId) => {
    if (editingId) {
      await updateSubject(editingId, {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        numQuestions: Number(form.numQuestions),
        timeLimitMinutes: Number(form.timeLimitMinutes),
        resultsVisibility: form.resultsVisibility,
      }, actor);
      setEditingSubject(null);
    } else {
      await createSubject({ ...form, createdBy: currentUser.uid, actor });
    }
    await loadSubjects();
  };

  const handleToggleActive = async (subject) => {
    await toggleSubjectActive(subject.id, !subject.isActive, subject.name, actor, subject.code);
    await loadSubjects();
  };

  const handleDeleteConfirmed = async () => {
    await deleteSubject(subjectToDelete.id, subjectToDelete.name, actor, subjectToDelete.code);
    setSubjectToDelete(null);
    await loadSubjects();
  };

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Manage Subjects</h1>
          <p>Create the subjects students will see and set their question count and time limit.</p>
        </div>

        <SubjectForm
          onSubmit={handleSubmit}
          editingSubject={editingSubject}
          onCancelEdit={() => setEditingSubject(null)}
        />

        {loading ? (
          <Spinner label="Loading subjects..." />
        ) : (
          <SubjectTable
            subjects={subjects}
            onEdit={setEditingSubject}
            onDelete={setSubjectToDelete}
            onToggleActive={handleToggleActive}
          />
        )}
      </div>

      {subjectToDelete && (
        <ConfirmModal
          title="Delete Subject"
          message={`Are you sure you want to delete "${subjectToDelete.name}"? This cannot be undone and any related questions will become orphaned.`}
          confirmLabel="Delete"
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setSubjectToDelete(null)}
        />
      )}
    </DashboardLayout>
  );
}