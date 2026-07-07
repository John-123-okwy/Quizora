import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import { getUserProfile } from './firestore.service';
import { logActivity } from './activityLog.service';

const resultsRef = collection(db, 'examResults');

export async function submitExamResult({
  userId,
  subjectId,
  subjectName,
  subjectCode,
  resultsVisibility,
  answers,
  questions,
  timeTakenSeconds,
}) {
  let score = 0;
  const answerDetails = questions.map((q) => {
    const selectedIndex = answers[q.id] ?? null;
    const isCorrect = selectedIndex === q.correctIndex;
    if (isCorrect) score += 1;
    return {
      questionId: q.id,
      questionText: q.text,
      options: q.options,
      correctIndex: q.correctIndex,
      selectedIndex,
      isCorrect,
      explanation: q.explanation,
    };
  });

  const resultVisible = resultsVisibility !== 'locked';

  const docRef = await addDoc(resultsRef, {
    userId,
    subjectId,
    subjectName,
    score,
    totalQuestions: questions.length,
    answers: answerDetails,
    timeTakenSeconds,
    resultVisible,
    submittedAt: serverTimestamp(),
  });

  const profile = await getUserProfile(userId);
  logActivity({
    actorId: userId,
    actorRole: profile?.role || 'user',
    actorName: profile?.fullName || 'Unknown User',
    actorEmail: profile?.email || '',
    action: 'Submitted exam',
    details: `${subjectCode ? `[${subjectCode}] ` : ''}${subjectName} — scored ${score}/${questions.length}`,
  });

  return { id: docRef.id, score, totalQuestions: questions.length, answers: answerDetails, resultVisible };
}

export async function getResultById(resultId) {
  const snap = await getDoc(doc(db, 'examResults', resultId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getResultsByUser(userId) {
  const q = query(resultsRef, where('userId', '==', userId));
  const snap = await getDocs(q);
  const results = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return results.sort((a, b) => {
    const aTime = a.submittedAt?.toMillis ? a.submittedAt.toMillis() : 0;
    const bTime = b.submittedAt?.toMillis ? b.submittedAt.toMillis() : 0;
    return bTime - aTime;
  });
}

export async function getResultsBySubject(subjectId) {
  const q = query(resultsRef, where('subjectId', '==', subjectId));
  const snap = await getDocs(q);
  const results = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  const withNames = await Promise.all(
    results.map(async (r) => {
      const profile = await getUserProfile(r.userId);
      return { ...r, userFullName: profile?.fullName || 'Unknown User', userEmail: profile?.email || '' };
    })
  );

  return withNames.sort((a, b) => a.userFullName.localeCompare(b.userFullName));
}

export async function setResultVisibility(resultId, visible, actor) {
  await updateDoc(doc(db, 'examResults', resultId), { resultVisible: visible });
  if (actor) {
    logActivity({
      actorId: actor.uid,
      actorRole: actor.role,
      actorName: actor.fullName,
      actorEmail: actor.email,
      action: visible ? 'Released a result' : 'Locked a result',
    });
  }
}

export async function releaseAllResultsForSubject(subjectId, subjectName, actor) {
  const q = query(resultsRef, where('subjectId', '==', subjectId));
  const snap = await getDocs(q);
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.update(d.ref, { resultVisible: true }));
  await batch.commit();

  if (actor) {
    logActivity({
      actorId: actor.uid,
      actorRole: actor.role,
      actorName: actor.fullName,
      actorEmail: actor.email,
      action: 'Released all results',
      details: subjectName,
    });
  }
}

export async function lockAllResultsForSubject(subjectId, subjectName, actor) {
  const q = query(resultsRef, where('subjectId', '==', subjectId));
  const snap = await getDocs(q);
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.update(d.ref, { resultVisible: false }));
  await batch.commit();

  if (actor) {
    logActivity({
      actorId: actor.uid,
      actorRole: actor.role,
      actorName: actor.fullName,
      actorEmail: actor.email,
      action: 'Locked all results',
      details: subjectName,
    });
  }
}

export async function deleteResult(resultId, subjectName, actor) {
  await deleteDoc(doc(db, 'examResults', resultId));
  if (actor) {
    logActivity({
      actorId: actor.uid,
      actorRole: actor.role,
      actorName: actor.fullName,
      actorEmail: actor.email,
      action: 'Deleted a result',
      details: subjectName,
    });
  }
}

export async function deleteAllResultsForSubject(subjectId, subjectName, actor) {
  const q = query(resultsRef, where('subjectId', '==', subjectId));
  const snap = await getDocs(q);
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();

  if (actor) {
    logActivity({
      actorId: actor.uid,
      actorRole: actor.role,
      actorName: actor.fullName,
      actorEmail: actor.email,
      action: 'Cleared all results',
      details: `${subjectName} — ${snap.docs.length} result(s) deleted`,
    });
  }

  return snap.docs.length;
}