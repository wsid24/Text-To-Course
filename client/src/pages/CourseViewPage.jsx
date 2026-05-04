import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCourseById } from '../api/endpoints';
import Spinner from '../components/ui/Spinner';
import {
  ArrowLeft, BookOpen, ChevronDown, ChevronRight,
  FileText, Layers, GraduationCap,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CourseViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const res = await getCourseById(id);
        setCourse(res.data.course);
        // Expand first module by default
        if (res.data.course?.modules?.[0]) {
          setExpandedModules({ [res.data.course.modules[0]._id]: true });
        }
      } catch {
        toast.error('Course not found');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-3xl)' }}>
        <Spinner size={32} />
      </div>
    );
  }

  if (!course) return null;

  const totalLessons = course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 'var(--space-2xl) var(--space-lg)' }}>
      {/* Back button */}
      <button onClick={() => navigate('/dashboard')} className="btn btn-ghost"
        style={{ marginBottom: 'var(--space-lg)', color: 'var(--text-tertiary)', gap: 6 }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      {/* Course header */}
      <div className="animate-fade-in" style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-2xl)',
        marginBottom: 'var(--space-xl)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Gradient accent */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 4,
          background: 'var(--accent-gradient)',
        }} />

        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 'var(--space-lg)',
          flexWrap: 'wrap',
        }}>
          <div style={{
            width: 56, height: 56,
            borderRadius: 'var(--radius-lg)',
            background: 'var(--accent-glow)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <GraduationCap size={26} style={{ color: 'var(--accent-primary)' }} />
          </div>

          <div style={{ flex: 1 }}>
            <h1 style={{
              fontSize: '1.5rem', fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: 'var(--space-sm)',
            }}>{course.title}</h1>
            <p style={{
              color: 'var(--text-secondary)', fontSize: '0.9rem',
              lineHeight: 1.7, marginBottom: 'var(--space-md)',
            }}>{course.description}</p>

            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 'var(--space-md)',
              fontSize: '0.8rem', color: 'var(--text-tertiary)',
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Layers size={14} /> {course.modules?.length || 0} Modules
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <FileText size={14} /> {totalLessons} Lessons
              </span>
            </div>

            {/* Tags */}
            {course.tags?.length > 0 && (
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: '0.4rem',
                marginTop: 'var(--space-md)',
              }}>
                {course.tags.map((tag, i) => (
                  <span key={i} className="badge">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Module accordion */}
      <div className="stagger-children" style={{
        display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)',
      }}>
        {course.modules?.map((mod, mi) => {
          const isExpanded = expandedModules[mod._id];
          return (
            <div key={mod._id} style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              transition: 'border-color var(--duration-base) var(--ease-out)',
              ...(isExpanded ? { borderColor: 'var(--border-accent)' } : {}),
            }}>
              {/* Module header */}
              <button onClick={() => toggleModule(mod._id)} style={{
                width: '100%',
                display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
                padding: 'var(--space-lg)',
                textAlign: 'left',
                color: 'var(--text-primary)',
                transition: 'background var(--duration-base)',
                background: 'transparent',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: 32, height: 32,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--accent-glow)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.8rem',
                  color: 'var(--accent-primary)',
                  flexShrink: 0,
                }}>
                  {mi + 1}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: 600, fontSize: '0.95rem',
                    marginBottom: 2,
                  }}>{mod.title}</div>
                  <div style={{
                    fontSize: '0.75rem', color: 'var(--text-tertiary)',
                  }}>
                    {mod.lessons?.length || 0} lessons
                  </div>
                </div>

                <div style={{
                  transition: 'transform var(--duration-base) var(--ease-out)',
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  color: 'var(--text-tertiary)',
                }}>
                  <ChevronDown size={18} />
                </div>
              </button>

              {/* Lessons list */}
              {isExpanded && mod.lessons?.length > 0 && (
                <div style={{
                  borderTop: '1px solid var(--border-secondary)',
                  padding: 'var(--space-sm)',
                }}>
                  {mod.lessons.map((lesson, li) => (
                    <Link key={lesson._id}
                      to={`/courses/${course._id}/lessons/${lesson._id}`}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
                        padding: 'var(--space-sm) var(--space-md)',
                        borderRadius: 'var(--radius-sm)',
                        textDecoration: 'none',
                        color: 'var(--text-primary)',
                        transition: 'background var(--duration-fast)',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{
                        width: 6, height: 6,
                        borderRadius: '50%',
                        background: lesson.isEnriched ? 'var(--success)' : 'var(--border-primary)',
                        flexShrink: 0,
                      }} />
                      <span style={{
                        fontSize: '0.875rem', fontWeight: 500,
                        flex: 1,
                      }}>{lesson.title}</span>
                      <span style={{
                        fontSize: '0.7rem', color: 'var(--text-tertiary)',
                        fontWeight: 500,
                      }}>
                        {lesson.isEnriched ? 'Ready' : 'Generate'}
                      </span>
                      <ChevronRight size={14} style={{ color: 'var(--text-tertiary)' }} />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
