import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from './config';
import { createUserProfile } from './firestore.service';

export async function registerUser({ fullName, email, password }) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(user, { displayName: fullName });
  await createUserProfile(user.uid, { fullName, email });
  return user;
}

export async function loginUser({ email, password }) {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
}

export async function logoutUser() {
  await signOut(auth);
}

export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

export function subscribeToAuthChanges(callback) {
  return onAuthStateChanged(auth, callback);
}