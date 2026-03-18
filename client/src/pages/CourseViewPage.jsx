import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getCourseById } from "../api/courseApi";
import ModuleAccordion from "../components/course/ModuleAccordion";
import toast from "react-hot-toast";
import { HiOutlineArrowLeft } from "react-icons/hi";
import { capitalize } from "../utils/formatters";

const CourseViewPage = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await getCourseById(courseId);
        setCourse(res.data.course);
      } catch {
        toast.error("Failed to load course");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "5rem" }}>
        <div className="animate-spin" style={{ width: 32, height: 32, border: "3px solid var(--color-border)", borderTopColor: "var(--color-primary)", borderRadius: "50%" }} />
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ textAlign: "center", padding: "5rem" }}>
        <h2 style={{ color: "var(--color-text-heading)" }}>Course not found</h2>
        <Link to="/dashboard" style={{ color: "var(--color-primary-light)" }}>Back to Dashboard</Link>
      </div>
    );
  }

  // Calculate progress
  let totalLessons = 0, completedLessons = 0;
  course.modules?.forEach((m) => {
    totalLessons += m.lessons?.length || 0;
    completedLessons += m.lessons?.filter((l) => l.isCompleted).length || 0;
  });
  const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "2rem 1.5rem" }} className="animate-fade-in">
      <Link to="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", color: "var(--color-text-muted)", textDecoration: "none", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
        <HiOutlineArrowLeft /> Back to Dashboard
      </Link>

      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
          <span style={{ background: "rgba(99, 102, 241, 0.15)", padding: "0.2rem 0.65rem", borderRadius: "1rem", fontSize: "0.75rem", color: "var(--color-primary-light)", fontWeight: 600 }}>
            {capitalize(course.difficulty)}
          </span>
          <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{totalLessons} lessons</span>
        </div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-text-heading)", marginBottom: "0.5rem" }}>{course.title}</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>{course.description}</p>
      </div>

      {/* Progress */}
      <div className="glass" style={{ borderRadius: "0.75rem", padding: "1rem 1.25rem", marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.4rem" }}>
          <span style={{ color: "var(--color-text-muted)" }}>Overall Progress</span>
          <span style={{ fontWeight: 600, color: progress === 100 ? "var(--color-success)" : "var(--color-primary-light)" }}>{progress}% ({completedLessons}/{totalLessons})</span>
        </div>
        <div style={{ height: 8, borderRadius: 4, background: "rgba(99, 102, 241, 0.15)" }}>
          <div style={{
            height: "100%", borderRadius: 4, transition: "width 0.5s ease",
            width: `${progress}%`,
            background: progress === 100
              ? "linear-gradient(90deg, var(--color-success), #10b981)"
              : "linear-gradient(90deg, var(--color-primary), var(--color-accent))",
          }} />
        </div>
      </div>

      {/* Modules */}
      <div>
        {course.modules?.map((mod, i) => (
          <ModuleAccordion key={mod._id} module={mod} index={i} />
        ))}
      </div>
    </div>
  );
};

export default CourseViewPage;
