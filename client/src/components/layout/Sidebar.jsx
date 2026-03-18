import { NavLink } from "react-router-dom";
import { HiOutlineCheck, HiOutlineBookOpen } from "react-icons/hi";

const Sidebar = ({ course, currentLessonId }) => {
  if (!course) return null;

  return (
    <aside className="glass" style={{
      width: 280, minHeight: "calc(100vh - 60px)",
      padding: "1.5rem", overflowY: "auto",
      borderRadius: 0, borderTop: "none", borderBottom: "none", borderLeft: "none",
      position: "sticky", top: 60,
    }}>
      <h3 style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-muted)", marginBottom: "1rem" }}>
        Course Modules
      </h3>

      {course.modules?.map((mod) => (
        <div key={mod._id} style={{ marginBottom: "1.25rem" }}>
          <h4 style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-heading)", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <HiOutlineBookOpen style={{ color: "var(--color-primary-light)", flexShrink: 0 }} />
            {mod.title}
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem", paddingLeft: "1.4rem" }}>
            {mod.lessons?.map((lesson) => (
              <NavLink
                key={lesson._id}
                to={`/lessons/${lesson._id}`}
                style={{
                  fontSize: "0.8rem", textDecoration: "none", padding: "0.35rem 0.5rem", borderRadius: "0.4rem",
                  display: "flex", alignItems: "center", gap: "0.35rem", transition: "background 0.15s",
                  color: currentLessonId === lesson._id ? "var(--color-primary-light)" : "var(--color-text-muted)",
                  background: currentLessonId === lesson._id ? "rgba(99, 102, 241, 0.1)" : "transparent",
                }}
              >
                {lesson.isCompleted ? (
                  <HiOutlineCheck style={{ color: "var(--color-success)", flexShrink: 0 }} />
                ) : (
                  <span style={{ width: 8, height: 8, borderRadius: "50%", border: "1.5px solid var(--color-text-muted)", flexShrink: 0 }} />
                )}
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lesson.title}</span>
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </aside>
  );
};

export default Sidebar;
