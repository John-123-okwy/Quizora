import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import { useAuth } from '../../contexts/AuthContext';
import { createSupportTicket, getTicketsByUser } from '../../firebase/support.service';
import { formatFirestoreTimestamp } from '../../utils/formatDate';
import styles from './HelpSupport.module.css';

export default function HelpSupport() {
  const { currentUser, userProfile } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({ subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadTickets = async () => {
    setLoading(true);
    const data = await getTicketsByUser(currentUser.uid);
    setTickets(data);
    setLoading(false);
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.subject.trim() || !form.message.trim()) {
      setError('Please fill in both the subject and your message.');
      return;
    }

    try {
      setSubmitting(true);
      await createSupportTicket({
        userId: currentUser.uid,
        userName: userProfile.fullName,
        userEmail: userProfile.email,
        subject: form.subject,
        message: form.message,
      });
      setForm({ subject: '', message: '' });
      setSuccess('Your message has been sent to the admin team.');
      await loadTickets();
    } catch (err) {
      setError('Could not send your message. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Help & Support</h1>
          <p>Having an issue or a question? Send a message to the admin team below.</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.errorMsg}>{error}</div>}
          {success && <div className={styles.successMsg}>{success}</div>}

          <div className={styles.field}>
            <label htmlFor="subject">Subject</label>
            <input
              id="subject"
              type="text"
              placeholder="e.g. Unable to start Chemistry exam"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              placeholder="Describe your issue in detail..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>

          <button className={styles.submitBtn} type="submit" disabled={submitting}>
            {submitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>

        <h3 className={styles.sectionTitle}>Your Past Messages</h3>

        {loading ? (
          <Spinner label="Loading your messages..." />
        ) : tickets.length === 0 ? (
          <div className={styles.empty}>You haven't sent any messages yet.</div>
        ) : (
          tickets.map((ticket) => (
            <div className={styles.ticketCard} key={ticket.id}>
              <div className={styles.ticketHeader}>
                <div>
                  <div className={styles.ticketSubject}>{ticket.subject}</div>
                  <div className={styles.ticketDate}>{formatFirestoreTimestamp(ticket.createdAt)}</div>
                </div>
                <span className={`${styles.statusBadge} ${ticket.status === 'resolved' ? styles.statusResolved : styles.statusOpen}`}>
                  {ticket.status === 'resolved' ? 'Resolved' : 'Pending'}
                </span>
              </div>

              <div className={styles.ticketMessage}>{ticket.message}</div>

              {ticket.adminReply && (
                <div className={styles.replyBox}>
                  <div className={styles.replyLabel}>Admin Response</div>
                  {ticket.adminReply}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}