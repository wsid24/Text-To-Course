import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { loginUser, registerUser } from "../../api/authApi";
import toast from "react-hot-toast";
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser } from "react-icons/hi";

const AuthForm = ({ mode = "login" }) => {
  const isLogin = mode === "login";
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = isLogin ? await loginUser(form) : await registerUser(form);
      login(res.data.token, res.data.user);
      toast.success(isLogin ? "Welcome back!" : "Account created!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 420, margin: "0 auto", padding: "3rem 1.5rem" }}>
      <div className="glass glow" style={{ borderRadius: "1.25rem", padding: "2.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-text-heading)", marginBottom: "0.25rem" }}>
          {isLogin ? "Welcome Back" : "Create Account"}
        </h1>
        <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem", fontSize: "0.9rem" }}>
          {isLogin ? "Sign in to continue learning" : "Start your learning journey"}
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {!isLogin && (
            <div style={{ position: "relative" }}>
              <HiOutlineUser style={{ position: "absolute", left: 12, top: 13, color: "var(--color-text-muted)", fontSize: "1.15rem" }} />
              <input
                className="input-field"
                name="name"
                placeholder="Full name"
                value={form.name}
                onChange={handleChange}
                required
                style={{ paddingLeft: "2.5rem" }}
              />
            </div>
          )}

          <div style={{ position: "relative" }}>
            <HiOutlineMail style={{ position: "absolute", left: 12, top: 13, color: "var(--color-text-muted)", fontSize: "1.15rem" }} />
            <input
              className="input-field"
              name="email"
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
              required
              style={{ paddingLeft: "2.5rem" }}
            />
          </div>

          <div style={{ position: "relative" }}>
            <HiOutlineLockClosed style={{ position: "absolute", left: 12, top: 13, color: "var(--color-text-muted)", fontSize: "1.15rem" }} />
            <input
              className="input-field"
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              style={{ paddingLeft: "2.5rem" }}
            />
          </div>

          <button className="btn-primary" type="submit" disabled={loading} style={{ width: "100%", marginTop: "0.5rem" }}>
            {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <Link to={isLogin ? "/register" : "/login"} style={{ color: "var(--color-primary-light)", textDecoration: "none", fontWeight: 600 }}>
            {isLogin ? "Sign up" : "Sign in"}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
