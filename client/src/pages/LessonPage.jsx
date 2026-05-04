import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseById, generateLesson } from '../api/endpoints';
import Spinner from '../components/ui/Spinner';
import {
  ArrowLeft, Sparkles, CheckCircle2, XCircle,
  Code2, Play, BookOpen, ChevronRight, ChevronLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ───────── Content Block Renderers ───────── */

function HeadingBlock({ block }) {
  return (
    <h2 style={{
      fontSize: '1.35rem', fontWeight: 700,
      color: 'var(--text-primary)',
      marginTop: 'var(--space-xl)',
      marginBottom: 'var(--space-sm)',
      letterSpacing: '-0.01em',
    }}>
      {block.text || block.value}
    </h2>
  );
}

function ParagraphBlock({ block }) {
  return (
    <p style={{
      color: 'var(--text-secondary)',
      fontSize: '0.95rem', lineHeight: 1.85,
      marginBottom: 'var(--space-md)',
    }}>
      {block.text || block.value}
    </p>
  );
}

function CodeBlock({ block }) {
  return (
    <div style={{
      marginBottom: 'var(--space-lg)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      border: '1px solid var(--code-border)',
    }}>
      {/* Code header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
        padding: '0.5rem 1rem',
        background: 'var(--bg-tertiary)',
        borderBottom: '1px solid var(--code-border)',
        fontSize: '0.75rem', fontWeight: 600,
        color: 'var(--text-tertiary)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}>
        <Code2 size={12} />
        {block.language || 'code'}
      </div>
      <pre style={{
        background: 'var(--code-bg)',
        padding: 'var(--space-lg)',
        overflowX: 'auto',
        margin: 0,
        fontSize: '0.85rem',
        lineHeight: 1.7,
      }}>
        <code style={{
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-primary)',
        }}>
          {block.text || block.value || block.code}
        </code>
      </pre>
    </div>
  );
}

function VideoBlock({ block }) {
  return (
    <div style={{
      marginBottom: 'var(--space-lg)',
      background: 'var(--bg-tertiary)',
      border: '1px solid var(--border-primary)',
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-lg)',
      display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
    }}>
      <div style={{
        width: 40, height: 40,
        borderRadius: 'var(--radius-sm)',
        background: 'rgba(239, 68, 68, 0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Play size={18} style={{ color: '#ef4444' }} />
      </div>
      <div>
        <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 2 }}>
          Video Recommendation
        </div>
        <div style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
          Search YouTube: <em>"{block.query || block.url}"</em>
        </div>
      </div>
    </div>
  );
}

function MCQBlock({ block, index }) {
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const correctAnswer = block.answer;
  const isCorrect = selected === correctAnswer;

  const handleSelect = (opt) => {
    if (showResult) return;
    setSelected(opt);
    setShowResult(true);
  };

  return (
    <div style={{
      marginBottom: 'var(--space-lg)',
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border-primary)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-lg)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
        marginBottom: 'var(--space-md)',
      }}>
        <span className="badge" style={{ fontSize: '0.65rem' }}>Quiz {index + 1}</span>
      </div>

      <p style={{
        fontWeight: 600, fontSize: '0.95rem',
        marginBottom: 'var(--space-md)', lineHeight: 1.5,
      }}>
        {block.question}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        {block.options?.map((opt, i) => {
          let borderColor = 'var(--border-primary)';
          let bg = 'transparent';
          if (showResult) {
            if (opt === correctAnswer) {
              borderColor = 'var(--success)';
              bg = 'rgba(52, 211, 153, 0.08)';
            } else if (opt === selected && !isCorrect) {
              borderColor = 'var(--danger)';
              bg = 'rgba(248, 113, 113, 0.08)';
            }
          } else if (selected === opt) {
            borderColor = 'var(--accent-primary)';
            bg = 'var(--accent-glow)';
          }

          return (
            <button key={i} onClick={() => handleSelect(opt)} style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
              padding: 'var(--space-sm) var(--space-md)',
              border: `1px solid ${borderColor}`,
              borderRadius: 'var(--radius-md)',
              background: bg,
              textAlign: 'left',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              transition: 'all var(--duration-fast)',
              cursor: showResult ? 'default' : 'pointer',
            }}>
              <span style={{
                width: 24, height: 24,
                borderRadius: 'var(--radius-full)',
                border: `2px solid ${borderColor}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 700,
                flexShrink: 0,
                color: showResult && opt === correctAnswer ? 'var(--success)' :
                       showResult && opt === selected ? 'var(--danger)' :
                       'var(--text-tertiary)',
              }}>
                {showResult && opt === correctAnswer ? <CheckCircle2 size={14} /> :
                 showResult && opt === selected && !isCorrect ? <XCircle size={14} /> :
                 String.fromCharCode(65 + i)}
              </span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>

      {showResult && block.explanation && (
        <div style={{
          marginTop: 'var(--space-md)',
          padding: 'var(--space-md)',
          background: isCorrect ? 'rgba(52, 211, 153, 0.06)' : 'rgba(248, 113, 113, 0.06)',
          border: `1px solid ${isCorrect ? 'rgba(52, 211, 153, 0.2)' : 'rgba(248, 113, 113, 0.2)'}`,
          borderRadius: 'var(--radius-md)',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
        }}>
          <strong style={{ color: isCorrect ? 'var(--success)' : 'var(--danger)' }}>
            {isCorrect ? '✓ Correct!' : '✗ Incorrect.'}
          </strong>{' '}
          {block.explanation}
        </div>
      )}
    </div>
  );
}

/* ───────── Main Lesson Page ───────── */

export default function LessonPage() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Find current lesson position for prev/next
  const allLessons = course?.modules?.flatMap(m => m.lessons || []) || [];
  const currentIdx = allLessons.findIndex(l => l._id === lessonId);
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getCourseById(courseId);
        setCourse(res.data.course);
        const found = res.data.course.modules
          ?.flatMap(m => m.lessons || [])
          .find(l => l._id === lessonId);
        setLesson(found || null);
      } catch {
        toast.error('Failed to load lesson');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId, lessonId]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await generateLesson(lessonId);
      setLesson(res.data.lesson);
      toast.success('Lesson content generated!');
    } catch {
      toast.error('Failed to generate lesson');
    } finally {
      setGenerating(false);
    }
  };

  const renderBlock = (block, i) => {
    const type = block.type?.toLowerCase();
    switch (type) {
      case 'heading':    return <HeadingBlock key={i} block={block} />;
      case 'paragraph':  return <ParagraphBlock key={i} block={block} />;
      case 'code':       return <CodeBlock key={i} block={block} />;
      case 'video':      return <VideoBlock key={i} block={block} />;
      case 'mcq':        return <MCQBlock key={i} block={block} index={i} />;
      default:           return <ParagraphBlock key={i} block={{ text: JSON.stringify(block) }} />;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-3xl)' }}>
        <Spinner size={32} />
      </div>
    );
  }

  if (!lesson) return null;

  const hasContent = lesson.isEnriched && lesson.content?.length > 0;

  // Count MCQs for the quiz section label
  let mcqIndex = 0;

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: 'var(--space-2xl) var(--space-lg)' }}>
      {/* Back nav */}
      <button onClick={() => navigate(`/courses/${courseId}`)}
        className="btn btn-ghost"
        style={{ marginBottom: 'var(--space-lg)', color: 'var(--text-tertiary)', gap: 6 }}>
        <ArrowLeft size={16} /> Back to Course
      </button>

      {/* Lesson header */}
      <div className="animate-fade-in" style={{ marginBottom: 'var(--space-2xl)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
          marginBottom: 'var(--space-sm)',
        }}>
          <BookOpen size={16} style={{ color: 'var(--accent-primary)' }} />
          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', fontWeight: 500 }}>
            {course?.title}
          </span>
        </div>
        <h1 style={{
          fontSize: '1.75rem', fontWeight: 800,
          letterSpacing: '-0.02em',
          lineHeight: 1.25,
        }}>
          {lesson.title}
        </h1>
      </div>

      {/* Content area */}
      {hasContent ? (
        <div className="animate-fade-in prose" style={{ marginBottom: 'var(--space-2xl)' }}>
          {lesson.content.map((block, i) => {
            if (block.type === 'mcq') {
              const el = <MCQBlock key={i} block={block} index={mcqIndex} />;
              mcqIndex++;
              return el;
            }
            return renderBlock(block, i);
          })}
        </div>
      ) : (
        /* Generate prompt */
        <div className="animate-scale-in" style={{
          textAlign: 'center',
          padding: 'var(--space-3xl) var(--space-lg)',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-xl)',
          marginBottom: 'var(--space-2xl)',
        }}>
          <div style={{
            width: 64, height: 64,
            borderRadius: 'var(--radius-lg)',
            background: 'var(--accent-glow)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto var(--space-lg)',
          }}>
            <Sparkles size={28} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <h3 style={{
            fontSize: '1.15rem', fontWeight: 700,
            marginBottom: 'var(--space-xs)',
          }}>Lesson content not yet generated</h3>
          <p style={{
            color: 'var(--text-tertiary)', fontSize: '0.875rem',
            maxWidth: 400, margin: '0 auto var(--space-lg)', lineHeight: 1.6,
          }}>
            Click below to generate AI-powered content for this lesson, 
            including explanations, code examples, and quizzes.
          </p>
          <button onClick={handleGenerate}
            className="btn btn-primary btn-lg"
            disabled={generating}
            style={{ opacity: generating ? 0.7 : 1 }}>
            {generating ? (
              <>
                <Spinner size={16} style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} />
                Generating content…
              </>
            ) : (
              <><Sparkles size={16} /> Generate Lesson</>
            )}
          </button>
        </div>
      )}

      {/* Prev / Next nav */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        paddingTop: 'var(--space-lg)',
        borderTop: '1px solid var(--border-primary)',
        gap: 'var(--space-md)',
      }}>
        {prevLesson ? (
          <button onClick={() => navigate(`/courses/${courseId}/lessons/${prevLesson._id}`)}
            className="btn btn-secondary" style={{ gap: 6 }}>
            <ChevronLeft size={16} /> Previous
          </button>
        ) : <div />}

        {nextLesson ? (
          <button onClick={() => navigate(`/courses/${courseId}/lessons/${nextLesson._id}`)}
            className="btn btn-primary" style={{ gap: 6 }}>
            Next <ChevronRight size={16} />
          </button>
        ) : <div />}
      </div>
    </div>
  );
}
