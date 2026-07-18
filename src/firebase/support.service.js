import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import { logActivity } from './activityLog.service';

const ticketsRef = collection(db, 'supportTickets');

export async function createSupportTicket({ userId, userName, userEmail, subject, message }) {
  const docRef = await addDoc(ticketsRef, {
    userId,
    userName,
    userEmail,
    subject: subject.trim(),
    message: message.trim(),
    status: 'open', // 'open' | 'resolved'
    adminReply: '',
    createdAt: serverTimestamp(),
    repliedAt: null,
  });

  logActivity({
    actorId: userId,
    actorRole: 'user',
    actorName: userName,
    actorEmail: userEmail,
    action: 'Submitted a support ticket',
    details: subject.trim().slice(0, 60),
  });

  return docRef.id;
}

export async function getTicketsByUser(userId) {
  const q = query(ticketsRef, where('userId', '==', userId));
  const snap = await getDocs(q);
  const tickets = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return tickets.sort((a, b) => {
    const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
    const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
    return bTime - aTime;
  });
}

export async function getAllTickets() {
  const q = query(ticketsRef, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function replyToTicket(ticketId, replyText, actor) {
  await updateDoc(doc(db, 'supportTickets', ticketId), {
    adminReply: replyText.trim(),
    status: 'resolved',
    repliedAt: serverTimestamp(),
  });

  if (actor) {
    logActivity({
      actorId: actor.uid,
      actorRole: actor.role,
      actorName: actor.fullName,
      actorEmail: actor.email,
      action: 'Replied to a support ticket',
    });
  }
}

export async function reopenTicket(ticketId, actor) {
  await updateDoc(doc(db, 'supportTickets', ticketId), {
    status: 'open',
  });

  if (actor) {
    logActivity({
      actorId: actor.uid,
      actorRole: actor.role,
      actorName: actor.fullName,
      actorEmail: actor.email,
      action: 'Reopened a support ticket',
    });
  }
}