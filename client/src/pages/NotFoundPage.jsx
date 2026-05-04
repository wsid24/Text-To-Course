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
    }}>
      <div style={{
        fontSize: '5rem', fontWeight: 900,
        background: 'var(--accent-gradient)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        lineHeight: 1,
        marginBottom: 'var(--space-md)',
      }}>404</div>
      <h2 style={{
        fontSize: '1.25rem', fontWeight: 700,
        marginBottom: 'var(--space-sm)',
      }}>Page not found</h2>
      <p style={{
        color: 'var(--text-tertiary)', fontSize: '0.9rem',
        marginBottom: 'var(--space-xl)',
      }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary" style={{ gap: 6 }}>
        <ArrowLeft size={16} /> Go Home
      </Link>
    </div>
  );
}
