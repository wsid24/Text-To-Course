import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { HiOutlineSparkles, HiOutlineBookOpen, HiOutlineLightningBolt, HiOutlineAcademicCap } from "react-icons/hi";

const features = [
  { icon: <HiOutlineSparkles />, title: "AI-Powered", desc: "Gemini generates complete, structured courses instantly" },
  { icon: <HiOutlineBookOpen />, title: "Structured Learning", desc: "Organized modules and lessons with clear progression" },
  { icon: <HiOutlineLightningBolt />, title: "Any Topic", desc: "From programming to philosophy — learn anything" },
];

const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div style={{ padding: "2rem" }}>
      {/* Hero */}
      <section style={{
        textAlign: "center", padding: "5rem 1rem 4rem",
        maxWidth: 700, margin: "0 auto",
      }} className="animate-fade-in">
        <div style={{
          width: 64, height: 64, borderRadius: "1rem", margin: "0 auto 1.5rem",
          background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem", color: "white",
        }}>
          <HiOutlineAcademicCap />
        </div>

        <h1 style={{ fontSize: "3rem", fontWeight: 800, lineHeight: 1.15, marginBottom: "1rem" }}>
          Learn Anything with{" "}
          <span className="gradient-text">AI-Generated</span>{" "}
          Courses
        </h1>

        <p style={{ fontSize: "1.15rem", color: "var(--color-text-muted)", lineHeight: 1.6, marginBottom: "2rem", maxWidth: 520, margin: "0 auto 2rem" }}>
          Enter any topic and get a complete, structured course with modules and lessons — powered by Google Gemini AI.
        </p>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <Link to={user ? "/dashboard" : "/register"} className="btn-primary" style={{ padding: "0.85rem 2rem", fontSize: "1.05rem" }}>
            Start Learning — Free
          </Link>
          {!user && (
            <Link to="/login" style={{
              padding: "0.85rem 2rem", fontSize: "1.05rem", borderRadius: "0.75rem",
              border: "1px solid var(--color-border)", color: "var(--color-text)",
              textDecoration: "none", fontWeight: 600, transition: "all 0.2s",
            }}>
              Sign In
            </Link>
          )}
        </div>
      </section>

      {/* Features */}
      <section style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem",
        maxWidth: 800, margin: "0 auto", padding: "2rem 0 5rem",
      }}>
        {features.map((f, i) => (
          <div key={i} className="glass glass-hover animate-fade-in" style={{
            borderRadius: "1rem", padding: "1.75rem", textAlign: "center",
            animationDelay: `${i * 0.1}s`, animationFillMode: "backwards",
          }}>
            <div style={{ fontSize: "2rem", color: "var(--color-primary-light)", marginBottom: "0.75rem" }}>{f.icon}</div>
            <h3 style={{ fontWeight: 600, color: "var(--color-text-heading)", marginBottom: "0.35rem" }}>{f.title}</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", lineHeight: 1.5 }}>{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default LandingPage;
