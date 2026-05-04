import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCourses, generateCourse, deleteCourse } from '../api/endpoints';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import {
  BookOpen, Plus, Trash2, ChevronRight, Sparkles,
  Clock, Layers, Search, GraduationCap,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topic, setTopic] = useState('');
  const [generating, setGenerating] = useState(false);
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

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setGenerating(true);
    try {
      const res = await generateCourse({ topic: topic.trim() });
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
            fontSize: '1.75rem', fontWeight: 800,
            letterSpacing: '-0.02em', marginBottom: 'var(--space-xs)',
          }}>My Courses</h1>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
            {courses.length} course{courses.length !== 1 ? 's' : ''} generated
          </p>
        </div>
      </div>

      {/* Generate form */}
      <form onSubmit={handleGenerate} className="animate-fade-in" style={{
        display: 'flex', gap: 'var(--space-sm)',
        marginBottom: 'var(--space-2xl)',
      }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Sparkles size={16} style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--accent-primary)',
          }} />
          <input
            className="input"
            placeholder="Enter a topic to generate a course… e.g. Machine Learning"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            disabled={generating}
            style={{ paddingLeft: 40, fontSize: '0.9rem' }}
          />
        </div>
        <button type="submit" className="btn btn-primary"
          disabled={generating || !topic.trim()}
          style={{ whiteSpace: 'nowrap', opacity: generating ? 0.7 : 1 }}>
          {generating ? (
            <><Spinner size={16} style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} /> Generating…</>
          ) : (
            <><Plus size={16} /> Generate</>
          )}
        </button>
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
    </div>
  );
}
