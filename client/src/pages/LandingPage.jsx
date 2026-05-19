import { Link } from 'react-router-dom';
import { Sparkles, BookOpen, Zap, ArrowRight, Brain, FileText, Layers, Shield, Cpu } from 'lucide-react';
import AnimatedBackground from '../components/ui/AnimatedBackground';

export default function LandingPage() {
  return (
    <div style={{
      overflow: 'hidden',
      position: 'relative',
      minHeight: '100vh',
      background: 'var(--bg-primary)',
    }}>
      <AnimatedBackground />

      {/* Subtle radial accent glow behind hero */}
      <div style={{
        position: 'absolute',
        top: '25%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '70vw', height: '55vh',
        background: 'radial-gradient(ellipse at center, var(--accent-glow-strong) 0%, transparent 65%)',
        pointerEvents: 'none',
        filter: 'blur(80px)',
        zIndex: 0,
      }} />

      {/* HERO */}
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
          maxWidth: 920,
        }}>
          {/* Pill */}
          <div className="glass" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)',
            color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500,
            marginBottom: 'var(--space-xl)',
          }}>
            <Sparkles size={14} style={{ color: 'var(--accent-primary)' }} />
            AI-powered curriculum, in seconds
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(2.6rem, 6vw, 4.5rem)',
            fontFamily: 'var(--font-sans)',
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.04em',
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-md)',
          }}>
            Turn any topic into a
            <br />
            <span style={{
              background: 'var(--accent-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 32px var(--accent-glow-strong))',
            }}>
              complete course.
            </span>
          </h1>

          {/* Subhead */}
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: 'clamp(1rem, 1.6vw, 1.15rem)',
            lineHeight: 1.6,
            maxWidth: 640,
            marginBottom: 'var(--space-2xl)',
          }}>
            CourseForge generates structured modules, lessons, code blocks,
            and quizzes — from a single prompt.
          </p>

          {/* CTAs */}
          <div style={{
            display: 'flex', gap: 'var(--space-md)',
            justifyContent: 'center', flexWrap: 'wrap',
            marginBottom: 'var(--space-3xl)',
          }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              Sign up free <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              Sign in
            </Link>
          </div>

          {/* Feature row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 'var(--space-md)',
            width: '100%', maxWidth: 880,
          }}>
            {[
              { icon: Brain, label: 'Multi-stage AI pipeline', sub: 'Plan → write → validate → format' },
              { icon: BookOpen, label: '3–6 modules · 3–5 lessons', sub: 'Curriculum, schema-enforced' },
              { icon: Layers, label: 'Interactive MCQ quizzes', sub: '5–8 per lesson with instant feedback' },
              { icon: FileText, label: 'Offline PDF export', sub: 'jsPDF, searchable text output' },
              { icon: Cpu, label: 'Switchable LLM provider', sub: 'Groq primary, Gemini fallback' },
              { icon: Zap, label: 'Redis-cached generation', sub: 'Duplicate prompts hit cache, not LLM' },
            ].map((f, i) => (
              <div key={i} className="glass glass-hover" style={{
                padding: 'var(--space-lg) var(--space-md)',
                borderRadius: 'var(--radius-lg)',
                textAlign: 'left',
              }}>
                <f.icon size={18} style={{ color: 'var(--accent-primary)', marginBottom: 'var(--space-sm)' }} />
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: 2 }}>
                  {f.label}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                  {f.sub}
                </div>
              </div>
            ))}
          </div>

          {/* Trust strip */}
          <div style={{
            marginTop: 'var(--space-3xl)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 'var(--space-lg)', flexWrap: 'wrap',
            color: 'var(--text-tertiary)', fontSize: '0.78rem',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Shield size={13} /> Auth0 secured
            </span>
            <span style={{ width: 1, height: 12, background: 'var(--border-primary)' }} />
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Zap size={13} /> Sub-second outline
            </span>
            <span style={{ width: 1, height: 12, background: 'var(--border-primary)' }} />
            <span>3 concurrent sessions</span>
          </div>
        </div>
      </section>
    </div>
  );
}
