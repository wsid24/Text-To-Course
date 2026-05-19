import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      textAlign: 'center',
      padding: 'var(--space-xl)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient glow behind 404 numeral */}
      <div style={{
        position: 'absolute',
        top: '40%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 480, height: 480,
        background: 'radial-gradient(circle, var(--accent-glow-strong) 0%, transparent 60%)',
        filter: 'blur(80px)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          fontSize: 'clamp(5rem, 12vw, 8rem)',
          fontWeight: 900,
          background: 'var(--accent-gradient)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1,
          letterSpacing: '-0.06em',
          marginBottom: 'var(--space-md)',
          filter: 'drop-shadow(0 0 40px var(--accent-glow-strong))',
        }}>
          404
        </div>
        <h2 style={{
          fontSize: '1.4rem', fontWeight: 800,
          letterSpacing: '-0.02em',
          marginBottom: 'var(--space-sm)',
        }}>Page not found</h2>
        <p style={{
          color: 'var(--text-tertiary)', fontSize: '0.9rem',
          marginBottom: 'var(--space-xl)',
          maxWidth: 400,
          lineHeight: 1.6,
        }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary btn-lg" style={{ gap: 6 }}>
          <ArrowLeft size={16} /> Back to home
        </Link>
      </div>
    </div>
  );
}
