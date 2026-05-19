import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useLLM, ALLOWED_PROVIDERS } from '../../context/LLMContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Sun, Moon, Hexagon, BookOpen, LogOut, Menu, X,
  User, Mail, ChevronDown, Sparkles, Info, Zap, Cpu, Check,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const PROVIDER_META = {
  groq:   { label: 'Groq',   sub: 'Llama 3.3 70B · ~14k req/day',  icon: Zap },
  gemini: { label: 'Gemini', sub: 'gemini-2.0-flash-lite',         icon: Cpu },
};

export default function Navbar() {
  const { theme, toggle } = useTheme();
  const { isAuthenticated, logout, user } = useAuth();
  const { provider, setProvider } = useLLM();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [logoOpen, setLogoOpen] = useState(false);
  const [llmOpen, setLlmOpen] = useState(false);
  const userMenuRef = useRef(null);
  const logoMenuRef = useRef(null);
  const llmMenuRef = useRef(null);

  // close popovers on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserOpen(false);
      if (logoMenuRef.current && !logoMenuRef.current.contains(e.target)) setLogoOpen(false);
      if (llmMenuRef.current && !llmMenuRef.current.contains(e.target)) setLlmOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = () => {
    setUserOpen(false);
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  // Avatar = deterministic gradient + initials based on user identity.
  // Same user always gets the same color across sessions; different users
  // get visually distinct avatars without any image hosting or upload.
  const seed = user?.id || user?.email || 'guest';
  const initials = getInitials(user?.name || user?.email || 'U');
  const gradient = pickGradient(seed);

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      background: theme === 'dark' ? 'rgba(5, 5, 7, 0.72)' : 'rgba(255, 255, 255, 0.75)',
      borderBottom: '1px solid var(--border-secondary)',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '0 var(--space-lg)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 64,
      }}>
        {/* Logo + info popover */}
        <div ref={logoMenuRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
          <Link to={isAuthenticated ? '/dashboard' : '/'} style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
            textDecoration: 'none',
          }}>
            <div style={{
              width: 34, height: 34, position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              filter: 'drop-shadow(0 0 8px var(--accent-glow))',
            }}>
              <Hexagon size={34} stroke="url(#cf-grad)" strokeWidth={1.8} style={{ position: 'absolute' }} />
              <BookOpen size={15} stroke="url(#cf-grad)" strokeWidth={2.2} style={{ position: 'relative', zIndex: 1 }} />
              <svg width="0" height="0" style={{ position: 'absolute' }}>
                <defs>
                  <linearGradient id="cf-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--accent-primary-hover)" />
                    <stop offset="100%" stopColor="var(--accent-secondary)" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span style={{
              fontWeight: 800, fontSize: '1.1rem',
              background: 'var(--accent-gradient)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
            }}>CourseForge</span>
          </Link>

          {/* Info button */}
          <button
            onClick={() => setLogoOpen((o) => !o)}
            title="About CourseForge"
            style={{
              padding: 4, borderRadius: 'var(--radius-full)',
              color: 'var(--text-tertiary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
          >
            <Info size={14} />
          </button>

          {logoOpen && (
            <div className="animate-scale-in" style={{
              position: 'absolute',
              top: 'calc(100% + 8px)', left: 0,
              width: 320, padding: 'var(--space-md)',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 200,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                <Sparkles size={14} style={{ color: 'var(--accent-primary)' }} />
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>CourseForge</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginLeft: 'auto' }}>v1.0</span>
              </div>
              <p style={{ fontSize: '0.82rem', lineHeight: 1.55, color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' }}>
                AI-powered course generator. Type any topic, get a structured course with 3–6 modules,
                lessons, code examples, and interactive quizzes.
              </p>
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xs)',
                fontSize: '0.72rem', color: 'var(--text-tertiary)',
                paddingTop: 'var(--space-sm)',
                borderTop: '1px solid var(--border-secondary)',
              }}>
                <span>⚡ Groq + Gemini</span>
                <span>🔐 Auth0</span>
                <span>📦 Redis cache</span>
                <span>📄 PDF export</span>
              </div>
            </div>
          )}
        </div>

        {/* Desktop nav */}
        <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          {isAuthenticated && (
            <Link to="/dashboard" className="btn btn-ghost" style={{
              color: isActive('/dashboard') ? 'var(--accent-primary)' : undefined,
            }}>Dashboard</Link>
          )}

          {/* LLM selector — only meaningful when signed in */}
          {isAuthenticated && (
            <div ref={llmMenuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setLlmOpen((o) => !o)}
                title={`Generation provider: ${PROVIDER_META[provider].label}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid ' + (llmOpen ? 'var(--border-accent)' : 'var(--border-primary)'),
                  color: 'var(--text-secondary)',
                  fontSize: '0.78rem', fontWeight: 600,
                  transition: 'all var(--duration-base) var(--ease-out)',
                }}
              >
                {(() => { const Icon = PROVIDER_META[provider].icon; return <Icon size={14} style={{ color: 'var(--accent-primary)' }} />; })()}
                <span>{PROVIDER_META[provider].label}</span>
                <ChevronDown size={12} style={{
                  color: 'var(--text-tertiary)',
                  transition: 'transform var(--duration-base) var(--ease-out)',
                  transform: llmOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }} />
              </button>

              {llmOpen && (
                <div className="animate-scale-in" style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)', right: 0,
                  width: 240,
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  overflow: 'hidden',
                  zIndex: 200,
                }}>
                  <div style={{
                    padding: '8px var(--space-md) 4px',
                    fontSize: '0.65rem', fontWeight: 700,
                    color: 'var(--text-tertiary)',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>
                    Generation provider
                  </div>
                  {ALLOWED_PROVIDERS.map((p) => {
                    const meta = PROVIDER_META[p];
                    const Icon = meta.icon;
                    const active = p === provider;
                    return (
                      <button key={p} onClick={() => { setProvider(p); setLlmOpen(false); }}
                        style={{
                          width: '100%',
                          padding: '10px var(--space-md)',
                          display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
                          textAlign: 'left',
                          background: active ? 'var(--accent-glow)' : 'transparent',
                          transition: 'background var(--duration-fast)',
                        }}
                        onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                        onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <Icon size={15} style={{ color: active ? 'var(--accent-primary)' : 'var(--text-tertiary)' }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{meta.label}</div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>{meta.sub}</div>
                        </div>
                        {active && <Check size={14} style={{ color: 'var(--accent-primary)' }} />}
                      </button>
                    );
                  })}
                  <div style={{
                    padding: '8px var(--space-md)',
                    fontSize: '0.68rem',
                    color: 'var(--text-tertiary)',
                    borderTop: '1px solid var(--border-secondary)',
                    lineHeight: 1.45,
                  }}>
                    The other provider stays as automatic fallback if your primary hits a rate limit.
                  </div>
                </div>
              )}
            </div>
          )}

          <button onClick={toggle} className="btn-icon" title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} style={{
            width: 38, height: 38,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-primary)',
            color: 'var(--text-secondary)',
          }}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {isAuthenticated ? (
            <div ref={userMenuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setUserOpen((o) => !o)}
                title={user?.name || user?.email || 'Account'}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '4px 8px 4px 4px',
                  borderRadius: 'var(--radius-full)',
                  background: userOpen ? 'var(--bg-hover)' : 'transparent',
                  border: '1px solid ' + (userOpen ? 'var(--border-accent)' : 'transparent'),
                  transition: 'all var(--duration-base) var(--ease-out)',
                }}
                onMouseEnter={(e) => { if (!userOpen) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                onMouseLeave={(e) => { if (!userOpen) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: gradient,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.72rem', fontWeight: 800, color: '#fff',
                  letterSpacing: '-0.02em',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2)',
                }}>{initials}</div>
                <ChevronDown size={14} style={{
                  color: 'var(--text-tertiary)',
                  transition: 'transform var(--duration-base) var(--ease-out)',
                  transform: userOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }} />
              </button>

              {userOpen && (
                <div className="animate-scale-in" style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)', right: 0,
                  width: 260,
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  overflow: 'hidden',
                  zIndex: 200,
                }}>
                  {/* user summary */}
                  <div style={{
                    padding: 'var(--space-md)',
                    borderBottom: '1px solid var(--border-secondary)',
                    background: 'var(--accent-gradient-soft)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 8 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: '50%',
                        background: gradient,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.05rem', fontWeight: 800, color: '#fff',
                        letterSpacing: '-0.02em',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                      }}>{initials}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>{user?.name || 'User'}</div>
                        <div style={{
                          fontSize: '0.72rem', color: 'var(--text-tertiary)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>{user?.email || 'no email on profile'}</div>
                      </div>
                    </div>
                  </div>

                  {/* meta rows */}
                  <div style={{ padding: 'var(--space-xs) 0' }}>
                    <Row icon={User} label="Account ID" value={(user?.id || '').slice(0, 24) + '…'} />
                    {user?.email && <Row icon={Mail} label="Email" value={user.email} />}
                  </div>

                  {/* signout */}
                  <button onClick={handleLogout} style={{
                    width: '100%',
                    padding: 'var(--space-sm) var(--space-md)',
                    display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
                    color: 'var(--danger)',
                    borderTop: '1px solid var(--border-secondary)',
                    fontSize: '0.85rem', fontWeight: 600,
                    background: 'transparent',
                    transition: 'background var(--duration-fast) var(--ease-out)',
                  }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.06)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <LogOut size={15} /> Sign out
                  </button>
                </div>
              )}
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
          className="btn-icon mobile-toggle" style={{ display: 'none' }}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="mobile-panel" style={{
          padding: 'var(--space-lg)',
          borderTop: '1px solid var(--border-primary)',
          display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)',
        }}>
          {isAuthenticated && (
            <Link to="/dashboard" onClick={() => setMobileOpen(false)}
              className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>Dashboard</Link>
          )}
          <button onClick={toggle} className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>
            {theme === 'dark' ? <><Sun size={16} /> Light Mode</> : <><Moon size={16} /> Dark Mode</>}
          </button>
          {isAuthenticated ? (
            <button onClick={handleLogout} className="btn btn-ghost" style={{ justifyContent: 'flex-start', color: 'var(--danger)' }}>
              <LogOut size={16} /> Sign out
            </button>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)} className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>Sign in</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="btn btn-primary">Get Started</Link>
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

/**
 * Pull 1–2 initials from a name/email. "Siddhant Wani" → "SW", "siddhant@x.com" → "S".
 */
function getInitials(input) {
  if (!input) return 'U';
  const cleaned = String(input).split('@')[0].replace(/[._-]+/g, ' ').trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Pick a deterministic premium gradient based on the user's id/email.
 * Same input → same gradient, so the user's avatar color is consistent
 * across sessions, but different users get visually distinct avatars.
 */
const GRADIENTS = [
  'linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)',  // cyan (brand)
  'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',  // violet
  'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',  // amber
  'linear-gradient(135deg, #10b981 0%, #047857 100%)',  // emerald
  'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',  // red
  'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',  // pink
  'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',  // blue
  'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)',  // teal
];

function pickGradient(seed) {
  let hash = 0;
  for (let i = 0; i < String(seed).length; i += 1) {
    hash = (hash * 31 + String(seed).charCodeAt(i)) >>> 0;
  }
  return GRADIENTS[hash % GRADIENTS.length];
}

function Row({ icon: Icon, label, value }) {
  return (
    <div style={{
      padding: '6px var(--space-md)',
      display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
    }}>
      <Icon size={13} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.66rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
          {label}
        </div>
        <div style={{
          fontSize: '0.78rem', color: 'var(--text-primary)',
          fontFamily: 'var(--font-mono)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{value}</div>
      </div>
    </div>
  );
}
