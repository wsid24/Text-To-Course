import { Link } from 'react-router-dom';
import { Sparkles, BookOpen, Brain, Zap, ArrowRight, User } from 'lucide-react';
import AnimatedBackground from '../components/ui/AnimatedBackground';

export default function LandingPage() {
  return (
    <div style={{ overflow: 'hidden', position: 'relative', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <AnimatedBackground />
      
      {/* ─── MASSIVE AMBIENT GLOW ─── */}
      <div style={{
        position: 'absolute',
        top: '30%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '80vw', height: '60vh',
        background: 'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.15) 0%, transparent 60%)',
        pointerEvents: 'none',
        filter: 'blur(100px)',
        zIndex: 0,
      }} />

      {/* ─── HERO SECTION ─── */}
      <section style={{
        position: 'relative',
        zIndex: 1,
        minHeight: 'calc(100vh - 80px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 'var(--space-3xl) var(--space-lg)',
      }}>
        
        <div className="animate-fade-in-up" style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', textAlign: 'center',
          maxWidth: 900,
        }}>
          
          {/* Top Pill Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500,
            marginBottom: 'var(--space-xl)',
            backdropFilter: 'blur(10px)',
          }}>
            <Sparkles size={14} style={{ color: 'var(--accent-primary)' }} /> 
            Our Engine, Your Success
          </div>

          {/* Main Title */}
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontFamily: 'var(--font-sans)',
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.04em',
            background: 'linear-gradient(135deg, var(--text-primary) 0%, #d4af37 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 4px 15px rgba(0,0,0,0.4)) drop-shadow(0 0 40px rgba(212, 175, 55, 0.4))',
            marginBottom: 'var(--space-sm)',
          }}>
            No Time Limit Course Generation
          </h1>
          
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3.2rem)',
            fontFamily: 'var(--font-sans)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--accent-primary) 100%)', 
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 4px 15px rgba(0,0,0,0.3)) drop-shadow(0 0 30px rgba(16, 185, 129, 0.5))',
            marginBottom: 'var(--space-xl)',
          }}>
            Conquer your learning
          </h2>

          {/* Stat Badges (Fxology style) */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '1rem',
            justifyContent: 'center',
            marginBottom: 'var(--space-2xl)',
          }}>
            {[
              { icon: User, text: 'AI Generation' },
              { icon: BookOpen, text: 'Infinite Subjects' },
              { icon: Zap, text: 'Instant Results' }
            ].map((stat, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500,
              }}>
                <stat.icon size={14} style={{ color: 'var(--accent-primary)' }} />
                {stat.text}
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: '#ffffff', color: 'var(--accent-primary)',
              padding: '0.8rem 2rem', borderRadius: 'var(--radius-full)',
              fontWeight: 700, fontSize: '1rem',
              boxShadow: '0 0 30px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              Start Generating <ArrowRight size={18} />
            </Link>
            
            <Link to="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'transparent', color: 'var(--text-primary)',
              border: '1px solid rgba(255,255,255,0.2)',
              padding: '0.8rem 2rem', borderRadius: 'var(--radius-full)',
              fontWeight: 600, fontSize: '1rem',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
            >
              Free Trial
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
