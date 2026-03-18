import { useState } from "react";
import { HiOutlineChevronDown, HiOutlineChevronRight } from "react-icons/hi";
import LessonItem from "./LessonItem";

const ModuleAccordion = ({ module, index }) => {
  const [open, setOpen] = useState(index === 0);
  const completedCount = module.lessons?.filter((l) => l.isCompleted).length || 0;
  const totalCount = module.lessons?.length || 0;

  return (
    <div className="glass" style={{ borderRadius: "0.75rem", overflow: "hidden", marginBottom: "0.75rem" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", border: "none", background: "transparent",
          padding: "1rem 1.25rem", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          color: "var(--color-text-heading)", fontSize: "0.95rem", fontWeight: 600,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{
            width: 28, height: 28, borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center",
            background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
            fontSize: "0.75rem", fontWeight: 700, color: "white",
          }}>
            {index + 1}
          </span>
          {module.title}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: 400 }}>
            {completedCount}/{totalCount} lessons
          </span>
          {open ? <HiOutlineChevronDown /> : <HiOutlineChevronRight />}
        </div>
      </button>

      {open && (
        <div style={{ padding: "0 1.25rem 1rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {module.description && (
            <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "0.5rem", lineHeight: 1.5 }}>
              {module.description}
            </p>
          )}
          {module.lessons?.map((lesson) => (
            <LessonItem key={lesson._id} lesson={lesson} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ModuleAccordion;
