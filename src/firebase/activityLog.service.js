import { collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { db } from './config';

const logsRef = collection(db, 'activityLogs');

export async function logActivity({ actorId, actorRole, actorName, actorEmail, action, details }) {
  try {
    await addDoc(logsRef, {
      actorId,
      actorRole,
      actorName,
      actorEmail: actorEmail || '',
      action,
      details: details || '',
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}

export async function getAllActivityLogs() {
  const q = query(logsRef, orderBy('timestamp', 'desc'), limit(300));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}