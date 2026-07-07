import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';

export async function createUserProfile(uid, { fullName, email, role = 'user' }) {
  const userRef = doc(db, 'users', uid);
  const profile = {
    fullName,
    email,
    role, // 'user' | 'admin' | 'chief'
    status: 'active',
    createdAt: serverTimestamp(),
    lastActive: serverTimestamp(),
  };
  await setDoc(userRef, profile);
  return profile;
}

export async function getUserProfile(uid) {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  return snap.exists() ? snap.data() : null;
}

export async function checkChiefExists() {
  const configRef = doc(db, 'system', 'appConfig');
  const snap = await getDoc(configRef);
  return snap.exists() ? snap.data().chiefExists === true : false;
}

export async function promoteSelfToChief(uid) {
  const userRef = doc(db, 'users', uid);
  const configRef = doc(db, 'system', 'appConfig');

  const batch = writeBatch(db);
  batch.update(userRef, { role: 'chief' });
  batch.update(configRef, { chiefExists: true });
  await batch.commit();
}