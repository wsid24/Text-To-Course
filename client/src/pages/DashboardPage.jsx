import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCourses, generateCourse, disambiguateTopic, deleteCourse } from '../api/endpoints';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import {
  BookOpen, Plus, Trash2, ChevronRight, Sparkles,
  Clock, Layers, Search, GraduationCap, HelpCircle, X,
} from 'lucide-react';
import toast from 'react-hot-toast';

// Topic looks acronym-ish if it's short OR contains an isolated 2-5 letter
// uppercase token (e.g. "RAG" inside "What is RAG"). Used to skip the
// disambiguation API call on obviously-unambiguous phrases like
// "Introduction to Machine Learning".
const looksAcronymish = (raw) => {
  const t = raw.trim();
  if (!t) return false;
  if (t.length <= 6) return true;
  return /(^|\s)[A-Z]{2,5}(\s|$|[?.!,])/.test(t);
};

export default function DashboardPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topic, setTopic] = useState('');
  const [generating, setGenerating] = useState(false);
  const [checking, setChecking] = useState(false);
  const [clarification, setClarification] = useState(null); // { interpretations: [...] } or null
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  const fetchCourses = async () => {
    try {
      const res = await getCourses();
      setCourses(res.data.courses || []);
    } catch {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  const runGeneration = async (finalTopic) => {
    setGenerating(true);
    try {
      const res = await generateCourse({ topic: finalTopic });
      setCourses(prev => [res.data.course, ...prev]);
      setTopic('');
      toast.success('Course generated!');
      navigate(`/courses/${res.data.course._id}`);
    } catch {
      toast.error('Generation failed. Try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    const trimmed = topic.trim();
    if (!trimmed) return;

    // Only run the pre-flight ambiguity check on acronym-ish topics.
    // Spends one cheap LLM call on these instead of zero, and saves a much
    // more expensive full-pipeline call on the wrong interpretation.
    if (looksAcronymish(trimmed)) {
      setChecking(true);
      try {
        const res = await disambiguateTopic(trimmed);
        if (res.data.ambiguous && res.data.interpretations?.length > 1) {
          setClarification({ interpretations: res.data.interpretations });
          return;
        }
      } catch {
        // Best-effort — fall through to generation if the check fails.
      } finally {
        setChecking(false);
      }
    }

    runGeneration(trimmed);
  };

  const handleClarificationPick = (interpretation) => {
    const augmented = `${topic.trim()} (${interpretation.label})`;
    setClarification(null);
    runGeneration(augmented);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this course? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await deleteCourse(id);
      setCourses(prev => prev.filter(c => c._id !== id));
      toast.success('Course deleted');
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = courses.filter(c =>
    c.title?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 'var(--space-2xl) var(--space-lg)' }}>
      {/* Header */}
      <div className="animate-fade-in" style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        flexWrap: 'wrap', gap: 'var(--space-md)',
        marginBottom: 'var(--space-xl)',
      }}>
        <div>
          <h1 style={{
            fontSize: '2rem', fontWeight: 800,
            letterSpacing: '-0.03em', marginBottom: 'var(--space-xs)',
          }}>My Courses</h1>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
            {courses.length} course{courses.length !== 1 ? 's' : ''} generated
          </p>
        </div>
      </div>

      {/* Prompt hero — premium card with glowing input */}
      <form
        onSubmit={handleGenerate}
        className="animate-fade-in glass"
        style={{
          position: 'relative',
          padding: 'var(--space-lg)',
          borderRadius: 'var(--radius-xl)',
          marginBottom: 'var(--space-2xl)',
          overflow: 'hidden',
        }}
      >
        {/* subtle background glow */}
        <div style={{
          position: 'absolute',
          inset: '-40% -10% auto auto',
          width: 320, height: 320,
          background: 'radial-gradient(circle, var(--accent-glow-strong) 0%, transparent 60%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: 0,
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
            marginBottom: 'var(--space-sm)',
          }}>
            <Sparkles size={15} style={{ color: 'var(--accent-primary)' }} />
            <span style={{
              fontSize: '0.78rem', fontWeight: 600,
              color: 'var(--text-secondary)',
              letterSpacing: '0.02em', textTransform: 'uppercase',
            }}>
              Generate a course
            </span>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
            <input
              className="input"
              placeholder="e.g. Introduction to Machine Learning"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={generating || checking}
              style={{
                flex: 1, minWidth: 240,
                fontSize: '1rem', padding: '0.875rem 1rem',
                background: 'var(--bg-tertiary)',
              }}
            />
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={generating || checking || !topic.trim()}
              style={{ whiteSpace: 'nowrap', opacity: (generating || checking) ? 0.7 : 1 }}
            >
              {generating ? (
                <>
                  <Spinner size={16} style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} />
                  Generating…
                </>
              ) : checking ? (
                <>
                  <Spinner size={16} style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} />
                  Checking…
                </>
              ) : (
                <>Generate <Plus size={16} /></>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Search */}
      {courses.length > 0 && (
        <div className="animate-fade-in" style={{
          position: 'relative',
          marginBottom: 'var(--space-lg)',
        }}>
          <Search size={16} style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-tertiary)',
          }} />
          <input
            className="input"
            placeholder="Search courses…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 40, maxWidth: 360 }}
          />
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-3xl)' }}>
          <Spinner size={32} />
        </div>
      ) : filtered.length === 0 && courses.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No courses yet"
          description="Generate your first AI-powered course above to get started."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No results"
          description="No courses match your search. Try a different query."
        />
      ) : (
        /* Course Grid */
        <div className="stagger-children" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 'var(--space-lg)',
        }}>
          {filtered.map(course => (
            <div key={course._id} className="card" style={{
              display: 'flex', flexDirection: 'column',
              cursor: 'pointer',
              position: 'relative',
            }}>
              {/* Gradient accent strip */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                background: 'var(--accent-gradient)',
                borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
              }} />

              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)',
              }}>
                <Link to={`/courses/${course._id}`} style={{
                  flex: 1, textDecoration: 'none',
                }}>
                  <h3 style={{
                    fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.35,
                    color: 'var(--text-primary)',
                    marginBottom: 'var(--space-xs)',
                  }}>{course.title}</h3>
                </Link>
                <button
                  className="btn-icon"
                  onClick={(e) => { e.stopPropagation(); handleDelete(course._id); }}
                  disabled={deletingId === course._id}
                  style={{
                    color: 'var(--text-tertiary)', flexShrink: 0,
                    opacity: deletingId === course._id ? 0.5 : 1,
                  }}
                  title="Delete course"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <p style={{
                color: 'var(--text-tertiary)',
                fontSize: '0.825rem', lineHeight: 1.6,
                marginBottom: 'var(--space-md)',
                flex: 1,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
                {course.description}
              </p>

              {/* Tags */}
              {course.tags?.length > 0 && (
                <div style={{
                  display: 'flex', flexWrap: 'wrap', gap: '0.35rem',
                  marginBottom: 'var(--space-md)',
                }}>
                  {course.tags.slice(0, 3).map((tag, i) => (
                    <span key={i} className="badge">{tag}</span>
                  ))}
                </div>
              )}

              {/* Meta row */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                paddingTop: 'var(--space-sm)',
                borderTop: '1px solid var(--border-secondary)',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
                  fontSize: '0.75rem', color: 'var(--text-tertiary)',
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Layers size={12} /> {course.modules?.length || 0} modules
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} /> {formatDate(course.createdAt)}
                  </span>
                </div>
                <Link to={`/courses/${course._id}`} style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  color: 'var(--accent-primary)',
                  fontWeight: 600, fontSize: '0.8rem',
                  transition: 'gap var(--duration-base) var(--ease-out)',
                }}
                  onMouseEnter={e => e.currentTarget.style.gap = '8px'}
                  onMouseLeave={e => e.currentTarget.style.gap = '4px'}
                >
                  Open <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Disambiguation modal — only shown when DisambiguatorAgent flags ambiguity */}
      {clarification && (
        <div
          className="animate-fade-in"
          onClick={() => setClarification(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 'var(--space-lg)',
          }}
        >
          <div
            className="glass"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 520, width: '100%',
              padding: 'var(--space-lg)',
              borderRadius: 'var(--radius-xl)',
              position: 'relative',
            }}
          >
            <button
              className="btn-icon"
              onClick={() => setClarification(null)}
              style={{
                position: 'absolute', top: 'var(--space-sm)', right: 'var(--space-sm)',
                color: 'var(--text-tertiary)',
              }}
              aria-label="Close"
            >
              <X size={16} />
            </button>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
              marginBottom: 'var(--space-sm)',
            }}>
              <HelpCircle size={18} style={{ color: 'var(--accent-primary)' }} />
              <span style={{
                fontSize: '0.78rem', fontWeight: 600,
                color: 'var(--text-secondary)',
                letterSpacing: '0.02em', textTransform: 'uppercase',
              }}>
                Did you mean…
              </span>
            </div>

            <h3 style={{
              fontSize: '1.15rem', fontWeight: 700,
              marginBottom: 'var(--space-xs)',
              color: 'var(--text-primary)',
            }}>
              "{topic.trim()}" could mean a few things
            </h3>
            <p style={{
              color: 'var(--text-tertiary)',
              fontSize: '0.85rem',
              marginBottom: 'var(--space-md)',
            }}>
              Pick the one you want a course on so we don't generate the wrong topic.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {clarification.interpretations.map((it, i) => (
                <button
                  key={i}
                  onClick={() => handleClarificationPick(it)}
                  style={{
                    textAlign: 'left',
                    padding: 'var(--space-md)',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-secondary)',
                    borderRadius: 'var(--radius-lg)',
                    cursor: 'pointer',
                    transition: 'all var(--duration-base) var(--ease-out)',
                    color: 'var(--text-primary)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border-secondary)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    fontWeight: 600, fontSize: '0.95rem',
                    marginBottom: 4,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <span>{it.label}</span>
                    <ChevronRight size={14} style={{ color: 'var(--accent-primary)' }} />
                  </div>
                  <div style={{
                    color: 'var(--text-tertiary)',
                    fontSize: '0.8rem', lineHeight: 1.5,
                  }}>
                    {it.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
