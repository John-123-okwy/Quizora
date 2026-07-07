import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import BrandHeader from '../../components/common/BrandHeader';
import PasswordInput from '../../components/common/PasswordInput';
import styles from '../../components/auth/AuthForm.module.css';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedName = form.fullName.trim();
    if (!trimmedName || trimmedName.split(/\s+/).length < 2) {
      setError('Please enter your full name (surname and first name).');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await register(trimmedName, form.email.trim(), form.password);
      navigate('/onboarding');
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
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
        <h1 className={styles.title}>Create Account</h1>
        <p className={styles.subtitle}>Register to start taking exams on Quizora</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="e.g. Chukwu John"
              value={form.fullName}
              onChange={handleChange}
              required
            />
          </div>
          <p className={styles.hint}>Format: Surname FirstName</p>

          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Password</label>
            <PasswordInput
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className={styles.switchText}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}