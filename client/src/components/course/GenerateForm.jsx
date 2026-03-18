import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateCourse } from "../../api/courseApi";
import { DIFFICULTY_OPTIONS } from "../../utils/constants";
import toast from "react-hot-toast";
import { HiOutlineSparkles } from "react-icons/hi";

const GenerateForm = ({ compact = false }) => {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("beginner");
  const [moduleCount, setModuleCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return toast.error("Enter a topic");
    setLoading(true);
    try {
      const res = await generateCourse({ topic: topic.trim(), difficulty, moduleCount });
      toast.success("Course generated!");
      navigate(`/courses/${res.data.course._id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || "Generation failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
        <input
          className="input-field"
          placeholder="Enter a topic to learn..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          disabled={loading}
          style={{ flex: 1 }}
        />
        <button className="btn-primary" disabled={loading} style={{ whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <HiOutlineSparkles /> {loading ? "Generating..." : "Generate"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass glow animate-fade-in" style={{
      borderRadius: "1.25rem", padding: "2.5rem",
      display: "flex", flexDirection: "column", gap: "1.5rem",
      maxWidth: 560, margin: "0 auto",
    }}>
      <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
        <HiOutlineSparkles style={{ fontSize: "2.5rem", color: "var(--color-accent)", marginBottom: "0.5rem" }} />
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-text-heading)" }}>Generate a Course</h2>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Enter a topic and let AI build your curriculum</p>
      </div>

      <div>
        <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--color-text-muted)", display: "block", marginBottom: "0.4rem" }}>Topic *</label>
        <input
          className="input-field"
          placeholder="e.g. React Hooks, Machine Learning Basics, Python for Finance"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div>
          <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--color-text-muted)", display: "block", marginBottom: "0.4rem" }}>Difficulty</label>
          <select
            className="input-field"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            disabled={loading}
          >
            {DIFFICULTY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--color-text-muted)", display: "block", marginBottom: "0.4rem" }}>Modules</label>
          <input
            className="input-field"
            type="number"
            min={1}
            max={10}
            value={moduleCount}
            onChange={(e) => setModuleCount(Number(e.target.value))}
            disabled={loading}
          />
        </div>
      </div>

      <button className="btn-primary" type="submit" disabled={loading} style={{
        width: "100%", padding: "0.85rem", fontSize: "1rem",
        display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
      }}>
        {loading ? (
          <>
            <span className="animate-spin" style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", display: "inline-block" }} />
            Generating Course...
          </>
        ) : (
          <>
            <HiOutlineSparkles /> Generate Course
          </>
        )}
      </button>

      {loading && (
        <p style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
          This may take 30-60 seconds. AI is crafting your curriculum...
        </p>
      )}
    </form>
  );
};

export default GenerateForm;
