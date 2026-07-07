import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  writeBatch,
  serverTimestamp,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from './config';
import { logActivity } from './activityLog.service';

const questionsRef = collection(db, 'questions');

export async function getAllQuestions() {
  const q = query(questionsRef, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getQuestionsBySubject(subjectId) {
  const q = query(questionsRef, where('subjectId', '==', subjectId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createQuestion({
  subjectId,
  text,
  options,
  correctIndex,
  explanation,
  difficulty,
  createdBy,
  actor,
  subjectCode,
}) {
  const docRef = await addDoc(questionsRef, {
    subjectId,
    text: text.trim(),
    options: options.map((o) => o.trim()),
    correctIndex: Number(correctIndex),
    explanation: explanation.trim(),
    difficulty,
    createdBy,
    createdAt: serverTimestamp(),
  });

  if (actor) {
    logActivity({
      actorId: actor.uid,
      actorRole: actor.role,
      actorName: actor.fullName,
      actorEmail: actor.email,
      action: 'Added a question',
      details: `${subjectCode ? `[${subjectCode}] ` : ''}${text.slice(0, 60)}`,
    });
  }

  return docRef.id;
}

export async function updateQuestion(questionId, updates, actor, subjectCode) {
  const questionDoc = doc(db, 'questions', questionId);
  await updateDoc(questionDoc, updates);

  if (actor) {
    logActivity({
      actorId: actor.uid,
      actorRole: actor.role,
      actorName: actor.fullName,
      actorEmail: actor.email,
      action: 'Updated a question',
      details: `${subjectCode ? `[${subjectCode}] ` : ''}${(updates.text || '').slice(0, 60)}`,
    });
  }
}

export async function deleteQuestion(questionId, questionText, actor, subjectCode) {
  const questionDoc = doc(db, 'questions', questionId);
  await deleteDoc(questionDoc);

  if (actor) {
    logActivity({
      actorId: actor.uid,
      actorRole: actor.role,
      actorName: actor.fullName,
      actorEmail: actor.email,
      action: 'Deleted a question',
      details: `${subjectCode ? `[${subjectCode}] ` : ''}${(questionText || '').slice(0, 60)}`,
    });
  }
}

export async function bulkCreateQuestions(questionsArray, createdBy, actor) {
  const chunks = [];
  for (let i = 0; i < questionsArray.length; i += 450) {
    chunks.push(questionsArray.slice(i, i + 450));
  }

  for (const chunk of chunks) {
    const batch = writeBatch(db);
    chunk.forEach((q) => {
      const newDocRef = doc(questionsRef);
      batch.set(newDocRef, {
        subjectId: q.subjectId,
        text: q.text.trim(),
        options: q.options.map((o) => o.trim()),
        correctIndex: Number(q.correctIndex),
        explanation: (q.explanation || '').trim(),
        difficulty: q.difficulty || 'medium',
        createdBy,
        createdAt: serverTimestamp(),
      });
    });
    await batch.commit();
  }

  if (actor) {
    logActivity({
      actorId: actor.uid,
      actorRole: actor.role,
      actorName: actor.fullName,
      actorEmail: actor.email,
      action: 'Bulk uploaded questions',
      details: `${questionsArray.length} question(s)`,
    });
  }
}