import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../api/endpoints';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginUser({ email, password });
      login(res.data.token, res.data.user);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 'var(--space-xl)',
    }}>
      <div className="animate-scale-in" style={{
        width: '100%', maxWidth: 420,
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-2xl)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
          <h1 style={{
            fontSize: '1.5rem', fontWeight: 800,
            letterSpacing: '-0.02em', marginBottom: 'var(--space-xs)',
          }}>Welcome back</h1>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
            Sign in to continue learning
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{
          display: 'flex', flexDirection: 'column', gap: 'var(--space-md)',
        }}>
          <div style={{ position: 'relative' }}>
            <Mail size={16} style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--text-tertiary)',
            }} />
            <input className="input" type="email" placeholder="Email address"
              value={email} onChange={e => setEmail(e.target.value)}
              style={{ paddingLeft: 38 }} required />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={16} style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--text-tertiary)',
            }} />
            <input className="input" type={showPw ? 'text' : 'password'}
              placeholder="Password"
              value={password} onChange={e => setPassword(e.target.value)}
              style={{ paddingLeft: 38, paddingRight: 38 }} required />
            <button type="button" onClick={() => setShowPw(!showPw)} style={{
              position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--text-tertiary)', background: 'none', border: 'none',
              cursor: 'pointer', padding: 4,
            }}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <button type="submit" className="btn btn-primary btn-lg"
            disabled={loading}
            style={{ marginTop: 'var(--space-sm)', width: '100%', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Signing in…' : <>Sign In <ArrowRight size={16} /></>}
          </button>
        </form>

        <p style={{
          textAlign: 'center', marginTop: 'var(--space-lg)',
          color: 'var(--text-tertiary)', fontSize: '0.85rem',
        }}>
          Don't have an account?{' '}
          <Link to="/register" style={{
            color: 'var(--accent-primary)', fontWeight: 600,
          }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
