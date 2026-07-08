import { doc, updateDoc } from 'firebase/firestore';
import {
  updateProfile,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
} from 'firebase/auth';
import { db } from './config';
import { logActivity } from './activityLog.service';
import { uploadImageToCloudinary } from '../services/cloudinary.service';

export async function uploadProfilePhoto(userId, file) {
  const photoURL = await uploadImageToCloudinary(file);
  await updateDoc(doc(db, 'users', userId), { photoURL });
  return photoURL;
}

export async function updateUserName(authUser, newFullName) {
  await updateProfile(authUser, { displayName: newFullName });
  await updateDoc(doc(db, 'users', authUser.uid), { fullName: newFullName });
}

export async function changeUserPassword(authUser, currentPassword, newPassword) {
  const credential = EmailAuthProvider.credential(authUser.email, currentPassword);
  await reauthenticateWithCredential(authUser, credential);
  await updatePassword(authUser, newPassword);
}

export async function logProfileUpdate(actor, action) {
  logActivity({
    actorId: actor.uid,
    actorRole: actor.role,
    actorName: actor.fullName,
    actorEmail: actor.email,
    action,
  });
}