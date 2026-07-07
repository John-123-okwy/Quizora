import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import BrandHeader from "../../components/common/BrandHeader";
import PasswordInput from "../../components/common/PasswordInput";
import styles from "../../components/auth/AuthForm.module.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      await login(form.email.trim(), form.password);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div style={{ marginBottom: "1.25rem" }}>
          <BrandHeader />
        </div>
        <h1 className={styles.title}>Welcome back to Quizora</h1>
        <p className={styles.subtitle}>Login to continue to your dashboard</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              autoComplete="email"
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
              autoComplete="password"
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ textAlign: "right", marginBottom: "1rem" }}>
            <button
              className={styles.backBtn}
              style={{ marginRight: "5rem", color: " #4078e9",borderRadius:"5px"}}
              onClick={() => navigate("/")}
              aria-label="Go back"
            >
              ← Back to Landing page
            </button>
            <Link
              to="/forgot-password"
              style={{ fontSize: "0.85rem", color: "var(--color-primary)" }}
            >
              Forgot password?
            </Link>
          </div>

          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className={styles.switchText}>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
