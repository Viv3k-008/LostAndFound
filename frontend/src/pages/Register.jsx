import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/auth.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone }),
      });
      const data = await res.json();
      if (res.ok) {
        login(data);
        navigate('/');
      } else {
        setError(data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Network error — please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-glow" aria-hidden="true"></div>

      <div className="tag-card">
        <div className="tag-hole"></div>
        <div className="tag-stamp">CAMPUS LOST &amp; FOUND</div>

        <h1 className="tag-title">Create your account</h1>
        <p className="tag-subtitle">Report lost items and claim what's found.</p>

        <form onSubmit={handleSubmit} className="tag-form" noValidate>
          <label className="field">
            <span className="field-label">Full name</span>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Vivek Kumar Singh" required />
          </label>

          <label className="field">
            <span className="field-label">Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@college.edu" autoComplete="email" required />
          </label>

          <label className="field">
            <span className="field-label">Phone (shared only after an approved claim)</span>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98765 43210" />
          </label>

          <label className="field">
            <span className="field-label">Password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password" required />
          </label>

          {error && <p className="form-error" role="alert">{error}</p>}

          <button type="submit" className="tag-submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="tag-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;