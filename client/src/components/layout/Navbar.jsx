import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sun, Moon, BookOpen, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { theme, toggle } = useTheme();
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      background: theme === 'dark' ? 'rgba(10, 10, 15, 0.8)' : 'rgba(250, 250, 250, 0.85)',
      borderBottom: '1px solid var(--border-primary)',
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 var(--space-lg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 64,
      }}>
        {/* Logo */}
        <Link to={isAuthenticated ? '/dashboard' : '/'} style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
          textDecoration: 'none',
        }}>
          <div style={{
            width: 32, height: 32,
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-gradient)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BookOpen size={18} color="#fff" />
          </div>
          <span style={{
            fontWeight: 800,
            fontSize: '1.1rem',
            background: 'var(--accent-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
          }}>
            CourseForge
          </span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}
             className="desktop-nav">
          {isAuthenticated && (
            <Link to="/dashboard" className="btn btn-ghost" style={{
              color: isActive('/dashboard') ? 'var(--accent-primary)' : undefined,
            }}>
              Dashboard
            </Link>
          )}

          <button onClick={toggle} className="btn-icon" style={{
            width: 38, height: 38,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-primary)',
            color: 'var(--text-secondary)',
            transition: 'all var(--duration-base) var(--ease-out)',
          }}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <div style={{
                width: 32, height: 32,
                borderRadius: 'var(--radius-full)',
                background: 'var(--accent-gradient)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: 700, color: '#fff',
              }}>
                {(user?.name || user?.email || 'U')[0].toUpperCase()}
              </div>
              <button onClick={handleLogout} className="btn btn-ghost" style={{
                color: 'var(--text-tertiary)', fontSize: '0.85rem',
              }}>
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              <Link to="/login" className="btn btn-ghost">Sign in</Link>
              <Link to="/register" className="btn btn-primary">Get Started</Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)}
          className="btn-icon mobile-toggle"
          style={{ display: 'none' }}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div style={{
          padding: 'var(--space-lg)',
          borderTop: '1px solid var(--border-primary)',
          display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)',
        }} className="mobile-panel">
          {isAuthenticated && (
            <Link to="/dashboard" onClick={() => setMobileOpen(false)}
              className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>
              Dashboard
            </Link>
          )}
          <button onClick={toggle} className="btn btn-ghost"
            style={{ justifyContent: 'flex-start' }}>
            {theme === 'dark' ? <><Sun size={16} /> Light Mode</> : <><Moon size={16} /> Dark Mode</>}
          </button>
          {isAuthenticated ? (
            <button onClick={handleLogout} className="btn btn-ghost"
              style={{ justifyContent: 'flex-start', color: 'var(--danger)' }}>
              <LogOut size={16} /> Log out
            </button>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)}
                className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>Sign in</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)}
                className="btn btn-primary">Get Started</Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
