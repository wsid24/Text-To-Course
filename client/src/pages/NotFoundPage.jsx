import { Link } from "react-router-dom";

const NotFoundPage = () => (
  <div style={{ textAlign: "center", padding: "6rem 2rem" }} className="animate-fade-in">
    <h1 className="gradient-text" style={{ fontSize: "5rem", fontWeight: 800, marginBottom: "0.5rem" }}>404</h1>
    <p style={{ color: "var(--color-text-muted)", fontSize: "1.1rem", marginBottom: "2rem" }}>Page not found</p>
    <Link to="/" className="btn-primary">Go Home</Link>
  </div>
);

export default NotFoundPage;
