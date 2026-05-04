import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../api/endpoints';
import { User, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [name, setName] = useState('');
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
      const res = await registerUser({ name, email, password });
      login(res.data.token, res.data.user);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
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
          }}>Create your account</h1>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
            Start generating AI-powered courses
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{
          display: 'flex', flexDirection: 'column', gap: 'var(--space-md)',
        }}>
          <div style={{ position: 'relative' }}>
            <User size={16} style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--text-tertiary)',
            }} />
            <input className="input" type="text" placeholder="Full name"
              value={name} onChange={e => setName(e.target.value)}
              style={{ paddingLeft: 38 }} required />
          </div>

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
              placeholder="Password (min 6 chars)"
              value={password} onChange={e => setPassword(e.target.value)}
              style={{ paddingLeft: 38, paddingRight: 38 }} required minLength={6} />
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
            {loading ? 'Creating account…' : <>Create Account <ArrowRight size={16} /></>}
          </button>
        </form>

        <p style={{
          textAlign: 'center', marginTop: 'var(--space-lg)',
          color: 'var(--text-tertiary)', fontSize: '0.85rem',
        }}>
          Already have an account?{' '}
          <Link to="/login" style={{
            color: 'var(--accent-primary)', fontWeight: 600,
          }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
