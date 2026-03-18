import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { HiOutlineLogout, HiOutlineAcademicCap } from "react-icons/hi";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="glass" style={{
      position: "sticky", top: 0, zIndex: 50,
      padding: "0.75rem 2rem",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      borderTop: "none", borderLeft: "none", borderRight: "none",
    }}>
      <Link to={user ? "/dashboard" : "/"} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <HiOutlineAcademicCap style={{ fontSize: "1.75rem", color: "var(--color-primary-light)" }} />
        <span className="gradient-text" style={{ fontSize: "1.25rem", fontWeight: 700 }}>Text-to-Learn</span>
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {user ? (
          <>
            <Link to="/generate" className="btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
              + New Course
            </Link>
            <span style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
              Hi, {user.name?.split(" ")[0]}
            </span>
            <button onClick={handleLogout} style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: "0.25rem",
              fontSize: "0.85rem", transition: "color 0.2s",
            }}
              onMouseEnter={(e) => e.target.style.color = "var(--color-danger)"}
              onMouseLeave={(e) => e.target.style.color = "var(--color-text-muted)"}
            >
              <HiOutlineLogout style={{ fontSize: "1.1rem" }} /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: "var(--color-text-muted)", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500 }}>Sign In</Link>
            <Link to="/register" className="btn-primary" style={{ padding: "0.5rem 1.25rem", fontSize: "0.85rem" }}>Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
