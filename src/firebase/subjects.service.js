import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import { db } from './config';
import { logActivity } from './activityLog.service';

const subjectsRef = collection(db, 'subjects');

export async function getAllSubjects() {
  const q = query(subjectsRef, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getActiveSubjects() {
  const q = query(subjectsRef, where('isActive', '==', true));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getSubjectById(subjectId) {
  const snap = await getDocs(query(subjectsRef, where('__name__', '==', subjectId)));
  const found = snap.docs[0];
  return found ? { id: found.id, ...found.data() } : null;
}

export async function createSubject({
  name,
  code,
  numQuestions,
  timeLimitMinutes,
  resultsVisibility,
  tabSwitchLimit,
  createdBy,
  actor,
}) {
  const docRef = await addDoc(subjectsRef, {
    name: name.trim(),
    code: code.trim().toUpperCase(),
    numQuestions: Number(numQuestions),
    timeLimitMinutes: Number(timeLimitMinutes),
    resultsVisibility: resultsVisibility || 'immediate',
    tabSwitchLimit: tabSwitchLimit ? Number(tabSwitchLimit) : null,
    isActive: true,
    createdBy,
    createdAt: serverTimestamp(),
  });

  if (actor) {
    logActivity({
      actorId: actor.uid,
      actorRole: actor.role,
      actorName: actor.fullName,
      actorEmail: actor.email,
      action: 'Created subject',
      details: `${name.trim()} (${code.trim().toUpperCase()})`,
    });
  }

  return docRef.id;
}

export async function updateSubject(subjectId, updates, actor) {
  const subjectDoc = doc(db, 'subjects', subjectId);
  await updateDoc(subjectDoc, updates);

  if (actor) {
    logActivity({
      actorId: actor.uid,
      actorRole: actor.role,
      actorName: actor.fullName,
      actorEmail: actor.email,
      action: 'Updated subject',
      details: `${updates.name || ''} ${updates.code ? `(${updates.code})` : ''}`.trim(),
    });
  }
}

export async function toggleSubjectActive(subjectId, isActive, subjectName, actor, subjectCode) {
  const subjectDoc = doc(db, 'subjects', subjectId);
  await updateDoc(subjectDoc, { isActive });

  if (actor) {
    logActivity({
      actorId: actor.uid,
      actorRole: actor.role,
      actorName: actor.fullName,
      actorEmail: actor.email,
      action: isActive ? 'Activated subject' : 'Deactivated subject',
      details: subjectCode ? `${subjectName} (${subjectCode})` : subjectName,
    });
  }
}

export async function deleteSubject(subjectId, subjectName, actor, subjectCode) {
  const subjectDoc = doc(db, 'subjects', subjectId);
  await deleteDoc(subjectDoc);

  if (actor) {
    logActivity({
      actorId: actor.uid,
      actorRole: actor.role,
      actorName: actor.fullName,
      actorEmail: actor.email,
      action: 'Deleted subject',
      details: subjectCode ? `${subjectName} (${subjectCode})` : subjectName,
    });
  }
}