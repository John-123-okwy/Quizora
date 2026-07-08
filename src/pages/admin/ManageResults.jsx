import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ResultDetailModal from '../../components/admin/ResultDetailModal';
import ConfirmModal from '../../components/common/ConfirmModal';
import Spinner from '../../components/common/Spinner';
import { useAuth } from '../../contexts/AuthContext';
import { getAllSubjects } from '../../firebase/subjects.service';
import {
  getResultsBySubject,
  setResultVisibility,
  releaseAllResultsForSubject,
  lockAllResultsForSubject,
  deleteResult,
  deleteAllResultsForSubject,
} from '../../firebase/results.service';
import { formatFirestoreTimestamp } from '../../utils/formatDate';
import { formatSecondsToMMSS } from '../../utils/formatTime';
import styles from './ManageResults.module.css';

export default function ManageResults() {
  const { currentUser, userProfile } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [results, setResults] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingResults, setLoadingResults] = useState(false);
  const [detailResult, setDetailResult] = useState(null);
  const [resultToDelete, setResultToDelete] = useState(null);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');

  const actor = { uid: currentUser.uid, role: userProfile.role, fullName: userProfile.fullName, email: userProfile.email };
  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  useEffect(() => {
    getAllSubjects().then((data) => {
      setSubjects(data);
      setLoadingSubjects(false);
      if (data.length > 0) setSelectedSubjectId(data[0].id);
    });
  }, []);

  const loadResults = async (subjectId) => {
    if (!subjectId) return;
    setLoadingResults(true);
    const data = await getResultsBySubject(subjectId);
    setResults(data);
    setLoadingResults(false);
  };

  useEffect(() => {
    if (selectedSubjectId) loadResults(selectedSubjectId);
  }, [selectedSubjectId]);

  const displayedResults = useMemo(() => {
    let filtered = results;
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      filtered = filtered.filter((r) => r.userFullName.toLowerCase().includes(term));
    }

    const sorted = [...filtered];
    if (sortBy === 'name') {
      sorted.sort((a, b) => a.userFullName.localeCompare(b.userFullName));
    } else if (sortBy === 'score') {
      sorted.sort((a, b) => b.score - a.score);
    } else if (sortBy === 'date') {
      sorted.sort((a, b) => {
        const aTime = a.submittedAt?.toMillis ? a.submittedAt.toMillis() : 0;
        const bTime = b.submittedAt?.toMillis ? b.submittedAt.toMillis() : 0;
        return bTime - aTime;
      });
    } else if (sortBy === 'time') {
      sorted.sort((a, b) => a.timeTakenSeconds - b.timeTakenSeconds);
    } else if (sortBy === 'violations') {
      sorted.sort((a, b) => (b.tabSwitchCount || 0) - (a.tabSwitchCount || 0));
    }
    return sorted;
  }, [results, searchTerm, sortBy]);

  const handleToggle = async (result) => {
    await setResultVisibility(result.id, !result.resultVisible, actor);
    await loadResults(selectedSubjectId);
  };

  const handleReleaseAll = async () => {
    await releaseAllResultsForSubject(selectedSubjectId, selectedSubject?.name, actor);
    await loadResults(selectedSubjectId);
  };

  const handleLockAll = async () => {
    await lockAllResultsForSubject(selectedSubjectId, selectedSubject?.name, actor);
    await loadResults(selectedSubjectId);
  };

  const handleDeleteConfirmed = async () => {
    await deleteResult(resultToDelete.id, resultToDelete.subjectName, actor);
    setResultToDelete(null);
    await loadResults(selectedSubjectId);
  };

  const handleClearAllConfirmed = async () => {
    await deleteAllResultsForSubject(selectedSubjectId, selectedSubject?.name, actor);
    setShowClearAllConfirm(false);
    await loadResults(selectedSubjectId);
  };

  if (loadingSubjects) {
    return (
      <DashboardLayout>
        <Spinner label="Loading subjects..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Manage Results</h1>
          <p>Release, lock, or permanently clear student results per subject.</p>
        </div>

        {subjects.length === 0 ? (
          <p className={styles.empty}>No subjects exist yet.</p>
        ) : (
          <>
            <div className={styles.controls}>
              <select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)}>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
              <button className={styles.releaseAllBtn} onClick={handleReleaseAll}>
                Release All Results
              </button>
              <button className={styles.lockAllBtn} onClick={handleLockAll}>
                Lock All Results
              </button>
              {results.length > 0 && (
                <button className={styles.clearAllBtn} onClick={() => setShowClearAllConfirm(true)}>
                  Clear All Results
                </button>
              )}
            </div>

            {results.length > 0 && (
              <div className={styles.searchSortRow}>
                <input
                  className={styles.searchInput}
                  type="text"
                  placeholder="Search by student name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                  className={styles.sortSelect}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="name">Sort: Name (A–Z)</option>
                  <option value="score">Sort: Highest Score</option>
                  <option value="date">Sort: Most Recent</option>
                  <option value="time">Sort: Fastest Time</option>
                  <option value="violations">Sort: Most Tab Switches</option>
                </select>
              </div>
            )}

            {loadingResults ? (
              <Spinner label="Loading results..." />
            ) : displayedResults.length === 0 ? (
              <div className={styles.tableWrapper}>
                <p className={styles.empty}>
                  {results.length === 0 ? 'No submissions for this subject yet.' : 'No results match your search.'}
                </p>
              </div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Score</th>
                      <th>Time Used</th>
                      <th>Tab Switches</th>
                      <th>Submitted At</th>
                      <th>Visibility</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedResults.map((r) => (
                      <tr key={r.id}>
                        <td>{r.userFullName}</td>
                        <td>{r.score}/{r.totalQuestions}</td>
                        <td>{formatSecondsToMMSS(r.timeTakenSeconds)}</td>
                        <td>
                          {r.tabSwitchCount > 0 ? (
                            <span className={styles.violationBadge}>⚠ {r.tabSwitchCount}</span>
                          ) : (
                            <span className={styles.noViolation}>—</span>
                          )}
                        </td>
                        <td>{formatFirestoreTimestamp(r.submittedAt)}</td>
                        <td>
                          <span className={`${styles.badge} ${r.resultVisible ? styles.visible : styles.hidden}`}>
                            {r.resultVisible ? 'Visible' : 'Hidden'}
                          </span>
                        </td>
                        <td>
                          <button className={styles.toggleBtn} onClick={() => handleToggle(r)}>
                            {r.resultVisible ? 'Hide' : 'Release'}
                          </button>
                          <button className={styles.detailsBtn} onClick={() => setDetailResult(r)}>
                            View Details
                          </button>
                          <button className={styles.deleteBtn} onClick={() => setResultToDelete(r)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {detailResult && (
        <ResultDetailModal result={detailResult} onClose={() => setDetailResult(null)} />
      )}

      {resultToDelete && (
        <ConfirmModal
          title="Delete This Result"
          message={`Permanently delete ${resultToDelete.userFullName}'s result for ${resultToDelete.subjectName}? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setResultToDelete(null)}
        />
      )}

      {showClearAllConfirm && (
        <ConfirmModal
          title="Clear All Results"
          message={`This will permanently delete ALL ${results.length} submission(s) for ${selectedSubject?.name}. This cannot be undone. Are you absolutely sure?`}
          confirmLabel="Clear All"
          onConfirm={handleClearAllConfirmed}
          onCancel={() => setShowClearAllConfirm(false)}
        />
      )}
    </DashboardLayout>
  );
}