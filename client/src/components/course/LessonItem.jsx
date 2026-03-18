import { Link } from "react-router-dom";
import { HiOutlineCheck, HiOutlineBookOpen } from "react-icons/hi";

const LessonItem = ({ lesson }) => {
  return (
    <Link
      to={`/lessons/${lesson._id}`}
      style={{
        display: "flex", alignItems: "center", gap: "0.65rem",
        padding: "0.6rem 0.75rem", borderRadius: "0.5rem",
        textDecoration: "none", transition: "background 0.15s",
        background: "rgba(99, 102, 241, 0.04)",
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(99, 102, 241, 0.1)"}
      onMouseLeave={(e) => e.currentTarget.style.background = "rgba(99, 102, 241, 0.04)"}
    >
      {lesson.isCompleted ? (
        <span style={{
          width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
          background: "var(--color-success)", color: "white", fontSize: "0.7rem", flexShrink: 0,
        }}>
          <HiOutlineCheck />
        </span>
      ) : (
        <span style={{
          width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
          border: "2px solid var(--color-border)", color: "var(--color-text-muted)", fontSize: "0.65rem", flexShrink: 0,
        }}>
          <HiOutlineBookOpen />
        </span>
      )}
      <span style={{ fontSize: "0.85rem", color: lesson.isCompleted ? "var(--color-text-muted)" : "var(--color-text)", fontWeight: 500 }}>
        {lesson.title}
      </span>
    </Link>
  );
};

export default LessonItem;
