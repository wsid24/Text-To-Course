import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLessonById, markLessonComplete } from "../api/lessonApi";
import { getCourseById } from "../api/courseApi";
import Sidebar from "../components/layout/Sidebar";
import Markdown from "react-markdown";
import toast from "react-hot-toast";
import { HiOutlineCheck, HiOutlineArrowRight, HiOutlineArrowLeft } from "react-icons/hi";

const LessonPage = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await getLessonById(lessonId);
        setLesson(res.data.lesson);

        // We need the course for the sidebar — get it through module → course chain
        // The lesson has moduleId, but we need courseId from the module
        // For simplicity, we'll find it via courses API
      } catch {
        toast.error("Failed to load lesson");
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [lessonId]);

  // Find the course this lesson belongs to (for sidebar navigation)
  useEffect(() => {
    if (!lesson?.moduleId) return;
    const fetchCourse = async () => {
      try {
        // Fetch all user courses and find the one containing this module
        const { getCourses } = await import("../api/courseApi");
        const res = await getCourses();
        const found = res.data.courses.find((c) =>
          c.modules?.some((m) => m._id === lesson.moduleId)
        );
        if (found) {
          const fullCourse = await getCourseById(found._id);
          setCourse(fullCourse.data.course);
        }
      } catch {
        // Sidebar won't show, but lesson content still works
      }
    };
    fetchCourse();
  }, [lesson?.moduleId]);

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await markLessonComplete(lessonId);
      setLesson({ ...lesson, isCompleted: true });
      toast.success("Lesson completed! 🎉");
    } catch {
      toast.error("Failed to mark as complete");
    } finally {
      setCompleting(false);
    }
  };

  // Get next/prev lesson IDs from course data
  const getAdjacentLessons = () => {
    if (!course) return { prev: null, next: null };
    const allLessons = [];
    course.modules?.forEach((m) => {
      m.lessons?.forEach((l) => allLessons.push(l));
    });
    const idx = allLessons.findIndex((l) => l._id === lessonId);
    return {
      prev: idx > 0 ? allLessons[idx - 1]._id : null,
      next: idx < allLessons.length - 1 ? allLessons[idx + 1]._id : null,
      courseId: course._id,
    };
  };

  const { prev, next, courseId } = getAdjacentLessons();

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "5rem" }}>
        <div className="animate-spin" style={{ width: 32, height: 32, border: "3px solid var(--color-border)", borderTopColor: "var(--color-primary)", borderRadius: "50%" }} />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div style={{ textAlign: "center", padding: "5rem" }}>
        <h2 style={{ color: "var(--color-text-heading)" }}>Lesson not found</h2>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 60px)" }}>
      {/* Sidebar */}
      {course && <Sidebar course={course} currentLessonId={lessonId} />}

      {/* Main content */}
      <main style={{ flex: 1, padding: "2rem 3rem", maxWidth: 800, margin: "0 auto" }} className="animate-fade-in">
        {courseId && (
          <button
            onClick={() => navigate(`/courses/${courseId}`)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "1.5rem", fontFamily: "'Inter', sans-serif" }}
          >
            <HiOutlineArrowLeft /> Course Overview
          </button>
        )}

        <h1 style={{ fontSize: "1.65rem", fontWeight: 700, color: "var(--color-text-heading)", marginBottom: "1.5rem" }}>
          {lesson.title}
        </h1>

        <div className="markdown-content" style={{ marginBottom: "2.5rem" }}>
          <Markdown>{lesson.content}</Markdown>
        </div>

        {/* Actions */}
        <div className="glass" style={{ borderRadius: "0.75rem", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            {prev && (
              <button onClick={() => navigate(`/lessons/${prev}`)} style={{
                background: "rgba(99, 102, 241, 0.1)", border: "1px solid var(--color-border)",
                color: "var(--color-text)", padding: "0.5rem 1rem", borderRadius: "0.5rem",
                cursor: "pointer", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.35rem",
                fontFamily: "'Inter', sans-serif",
              }}>
                <HiOutlineArrowLeft /> Previous
              </button>
            )}
            {next && (
              <button onClick={() => navigate(`/lessons/${next}`)} style={{
                background: "rgba(99, 102, 241, 0.1)", border: "1px solid var(--color-border)",
                color: "var(--color-text)", padding: "0.5rem 1rem", borderRadius: "0.5rem",
                cursor: "pointer", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.35rem",
                fontFamily: "'Inter', sans-serif",
              }}>
                Next <HiOutlineArrowRight />
              </button>
            )}
          </div>

          {!lesson.isCompleted ? (
            <button className="btn-primary" onClick={handleComplete} disabled={completing} style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <HiOutlineCheck /> {completing ? "Marking..." : "Mark Complete"}
            </button>
          ) : (
            <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--color-success)", fontSize: "0.85rem", fontWeight: 600 }}>
              <HiOutlineCheck /> Completed
            </span>
          )}
        </div>
      </main>
    </div>
  );
};

export default LessonPage;
