import { createContext, useContext, useState, useCallback } from 'react';

const STORAGE_KEY = 'quizora-exam-session';
const ExamSessionContext = createContext(null);

function readSession() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { subjectIds: [], resultIds: {} };
  } catch {
    return { subjectIds: [], resultIds: {} };
  }
}

function writeSession(session) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function ExamSessionProvider({ children }) {
  const [session, setSession] = useState(readSession);

  const startSession = useCallback((subjectIds) => {
    const newSession = { subjectIds, resultIds: {} };
    setSession(newSession);
    writeSession(newSession);
  }, []);

  const recordResult = useCallback((subjectId, resultId) => {
    setSession((prev) => {
      const updated = { ...prev, resultIds: { ...prev.resultIds, [subjectId]: resultId } };
      writeSession(updated);
      return updated;
    });
  }, []);

  const clearSession = useCallback(() => {
    setSession({ subjectIds: [], resultIds: {} });
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  const getSessionInfoForSubject = useCallback(
    (subjectId) => {
      const index = session.subjectIds.indexOf(subjectId);
      if (index === -1) {
        return { isPartOfSession: false, isLast: true, nextSubjectId: null, totalSubjects: 1 };
      }
      const isLast = index === session.subjectIds.length - 1;
      const nextSubjectId = isLast ? null : session.subjectIds[index + 1];
      return { isPartOfSession: true, isLast, nextSubjectId, totalSubjects: session.subjectIds.length };
    },
    [session]
  );

  const value = { session, startSession, recordResult, clearSession, getSessionInfoForSubject };

  return (
    <ExamSessionContext.Provider value={value}>
      {children}
    </ExamSessionContext.Provider>
  );
}

export function useExamSession() {
  const context = useContext(ExamSessionContext);
  if (!context) {
    throw new Error('useExamSession must be used within an ExamSessionProvider');
  }
  return context;
}