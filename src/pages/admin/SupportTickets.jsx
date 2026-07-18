import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import { useAuth } from '../../contexts/AuthContext';
import { getAllTickets, replyToTicket, reopenTicket } from '../../firebase/support.service';
import { formatFirestoreTimestamp } from '../../utils/formatDate';
import styles from './SupportTickets.module.css';

export default function SupportTickets() {
  const { currentUser, userProfile } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [replyDrafts, setReplyDrafts] = useState({});
  const [sendingId, setSendingId] = useState(null);

  const actor = { uid: currentUser.uid, role: userProfile.role, fullName: userProfile.fullName, email: userProfile.email };

  const loadTickets = async () => {
    setLoading(true);
    const data = await getAllTickets();
    setTickets(data);
    setLoading(false);
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return tickets;
    return tickets.filter((t) => t.status === statusFilter);
  }, [tickets, statusFilter]);

  const handleReply = async (ticketId) => {
    const replyText = replyDrafts[ticketId];
    if (!replyText || !replyText.trim()) return;

    setSendingId(ticketId);
    await replyToTicket(ticketId, replyText, actor);
    setReplyDrafts((prev) => ({ ...prev, [ticketId]: '' }));
    setSendingId(null);
    await loadTickets();
  };

  const handleReopen = async (ticketId) => {
    await reopenTicket(ticketId, actor);
    await loadTickets();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Spinner label="Loading support tickets..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Support Tickets</h1>
          <p>Messages sent by students needing help or reporting issues.</p>
        </div>

        <div className={styles.filters}>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Tickets</option>
            <option value="open">Pending Only</option>
            <option value="resolved">Resolved Only</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className={styles.empty}>No support tickets match this filter.</div>
        ) : (
          filtered.map((ticket) => (
            <div className={styles.ticketCard} key={ticket.id}>
              <div className={styles.ticketHeader}>
                <div className={styles.userInfo}>
                  <div className={styles.userName}>{ticket.userName}</div>
                  <div className={styles.userEmail}>{ticket.userEmail}</div>
                </div>
                <span className={`${styles.statusBadge} ${ticket.status === 'resolved' ? styles.statusResolved : styles.statusOpen}`}>
                  {ticket.status === 'resolved' ? 'Resolved' : 'Pending'}
                </span>
              </div>

              <div className={styles.ticketSubject}>{ticket.subject}</div>
              <div className={styles.ticketDate}>{formatFirestoreTimestamp(ticket.createdAt)}</div>

              <div className={styles.ticketMessage}>{ticket.message}</div>

              {ticket.adminReply && (
                <div className={styles.replyBox}>
                  <div className={styles.replyLabel}>
                    Your Response {ticket.repliedAt ? `· ${formatFirestoreTimestamp(ticket.repliedAt)}` : ''}
                  </div>
                  {ticket.adminReply}
                </div>
              )}

              {ticket.status === 'open' ? (
                <div className={styles.replyForm}>
                  <textarea
                    placeholder="Type your response..."
                    value={replyDrafts[ticket.id] || ''}
                    onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [ticket.id]: e.target.value }))}
                  />
                  <div className={styles.replyActions}>
                    <button
                      className={styles.sendReplyBtn}
                      onClick={() => handleReply(ticket.id)}
                      disabled={sendingId === ticket.id || !replyDrafts[ticket.id]?.trim()}
                    >
                      {sendingId === ticket.id ? 'Sending...' : 'Send Response & Mark Resolved'}
                    </button>
                  </div>
                </div>
              ) : (
                <button className={styles.reopenBtn} onClick={() => handleReopen(ticket.id)}>
                  Reopen Ticket
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}