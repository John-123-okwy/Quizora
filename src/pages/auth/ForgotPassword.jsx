import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import BrandHeader from '../../components/common/BrandHeader';
import styles from '../../components/auth/AuthForm.module.css';

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      await forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError('Could not send reset email. Check the address and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div style={{ marginBottom: '1.25rem' }}>
          <BrandHeader />
        </div>
        <h1 className={styles.title}>Reset Password</h1>
        <p className={styles.subtitle}>
          Enter your email and we'll send you a reset link.
        </p>

        {error && <div className={styles.error}>{error}</div>}

        {sent ? (
          <p style={{ color: 'var(--color-success)' }}>
            Reset link sent. Check your inbox (and spam folder).
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button className={styles.submitBtn} type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p className={styles.switchText}>
          <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}