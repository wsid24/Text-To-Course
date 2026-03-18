import { Link } from "react-router-dom";
import { HiOutlineTrash, HiOutlineArrowRight } from "react-icons/hi";
import { formatDate, capitalize } from "../../utils/formatters";

const CourseCard = ({ course, onDelete }) => {
  const progress = course.progress || 0;

  return (
    <div className="glass glass-hover animate-fade-in" style={{
      borderRadius: "1rem", padding: "1.5rem",
      display: "flex", flexDirection: "column", gap: "0.75rem",
      transition: "all 0.3s ease",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--color-text-heading)", marginBottom: "0.25rem" }}>
            {course.title}
          </h3>
          <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
            <span style={{ background: "rgba(99, 102, 241, 0.15)", padding: "0.15rem 0.5rem", borderRadius: "1rem", color: "var(--color-primary-light)" }}>
              {capitalize(course.difficulty)}
            </span>
            <span>{formatDate(course.createdAt)}</span>
          </div>
        </div>
        <button onClick={() => onDelete(course._id)} className="btn-danger" style={{ padding: "0.35rem 0.6rem", fontSize: "0.8rem" }}
          title="Delete course">
          <HiOutlineTrash />
        </button>
      </div>

      <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", lineHeight: 1.5 }}>
        {course.description?.substring(0, 120)}{course.description?.length > 120 ? "..." : ""}
      </p>

      {/* Progress bar */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "0.35rem" }}>
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: "rgba(99, 102, 241, 0.15)", overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 3, transition: "width 0.5s ease",
            width: `${progress}%`,
            background: progress === 100
              ? "linear-gradient(90deg, var(--color-success), #10b981)"
              : "linear-gradient(90deg, var(--color-primary), var(--color-accent))",
          }} />
        </div>
      </div>

      <Link to={`/courses/${course._id}`} style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem",
        color: "var(--color-primary-light)", textDecoration: "none", fontWeight: 600,
        fontSize: "0.85rem", marginTop: "0.25rem", transition: "gap 0.2s",
      }}
        onMouseEnter={(e) => e.currentTarget.style.gap = "0.6rem"}
        onMouseLeave={(e) => e.currentTarget.style.gap = "0.35rem"}
      >
        Continue Learning <HiOutlineArrowRight />
      </Link>
    </div>
  );
};

export default CourseCard;
