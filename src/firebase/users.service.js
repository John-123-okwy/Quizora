import { collection, doc, getDocs, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from './config';
import { logActivity } from './activityLog.service';

const usersRef = collection(db, 'users');

export async function getAllUsers() {
  const q = query(usersRef, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function promoteToAdmin(targetUserId, targetUserName, actor) {
  await updateDoc(doc(db, 'users', targetUserId), { role: 'admin' });
  logActivity({
    actorId: actor.uid,
    actorRole: actor.role,
    actorName: actor.fullName,
    actorEmail: actor.email,
    action: 'Promoted user to admin',
    details: targetUserName,
  });
}

export async function demoteToUser(targetUserId, targetUserName, actor) {
  await updateDoc(doc(db, 'users', targetUserId), { role: 'user' });
  logActivity({
    actorId: actor.uid,
    actorRole: actor.role,
    actorName: actor.fullName,
    actorEmail: actor.email,
    action: 'Demoted admin to user',
    details: targetUserName,
  });
}