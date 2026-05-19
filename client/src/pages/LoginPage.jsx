import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const { login, signup } = useAuth();

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 'var(--space-xl)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600, height: 600,
        background: 'radial-gradient(circle, var(--accent-glow-strong) 0%, transparent 60%)',
        filter: 'blur(80px)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <div className="animate-scale-in glass" style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: 440,
        borderRadius: 'var(--radius-2xl)',
        padding: 'var(--space-2xl)',
        textAlign: 'center',
        boxShadow: 'var(--shadow-2xl)',
      }}>
        <div style={{
          width: 60, height: 60,
          borderRadius: 'var(--radius-lg)',
          background: 'var(--accent-gradient-soft)',
          border: '1px solid var(--border-accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto var(--space-lg)',
          boxShadow: '0 0 30px var(--accent-glow)',
        }}>
          <ShieldCheck size={26} style={{ color: 'var(--accent-primary)' }} />
        </div>

        <h1 style={{
          fontSize: '1.6rem', fontWeight: 800,
          letterSpacing: '-0.025em', marginBottom: 'var(--space-xs)',
        }}>Sign in to continue</h1>
        <p style={{
          color: 'var(--text-tertiary)',
          fontSize: '0.875rem',
          marginBottom: 'var(--space-xl)',
          lineHeight: 1.55,
        }}>
          Authentication is handled securely via Auth0 (OAuth 2.0 / OIDC).
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          <button onClick={login} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
            <LogIn size={16} /> Sign in with Auth0
          </button>
          <button onClick={signup} className="btn btn-secondary btn-lg" style={{ width: '100%' }}>
            <UserPlus size={16} /> Create new account
          </button>
        </div>

        <p style={{
          marginTop: 'var(--space-xl)',
          fontSize: '0.72rem',
          color: 'var(--text-tertiary)',
          lineHeight: 1.5,
        }}>
          By continuing you agree to the Terms and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
