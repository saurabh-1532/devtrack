import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        name,
        email,
        password,
      });
      login(res.data.user, res.data.token);
      navigate('/app/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-orb-1" style={{
        top: 'auto', bottom: '-80px',
        left: 'auto', right: '-60px',
        background: 'radial-gradient(circle, rgba(34,204,136,0.12) 0%, transparent 70%)'
      }} />
      <div className="auth-orb-2" style={{
        bottom: 'auto', top: '-80px',
        right: 'auto', left: '-60px',
        background: 'radial-gradient(circle, rgba(108,95,255,0.15) 0%, transparent 70%)'
      }} />
      <div className="auth-grid" />

      <div className="auth-card">
        <div className="auth-logo-wrap">
          <div className="auth-logo-icon">⚡</div>
          <span className="auth-logo-name">Stride.</span>
        </div>

        <h1 className="auth-title">Create account</h1>
        <p className="auth-sub">// start learning with intention</p>

        {error && <div className="auth-error">✕ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label">Full name</label>
            <input
              className="auth-input"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Arjun Kumar"
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input
              className="auth-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="arjun@gmail.com"
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input
              className="auth-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            className="auth-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Get started'}
          </button>
        </form>

        <div className="auth-divider">
          <div className="auth-divider-line" />
          <span className="auth-divider-text">or</span>
          <div className="auth-divider-line" />
        </div>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;