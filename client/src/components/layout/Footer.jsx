const Footer = () => (
  <footer style={{
    textAlign: "center", padding: "2rem",
    color: "var(--color-text-muted)", fontSize: "0.8rem",
    borderTop: "1px solid var(--color-border)", marginTop: "auto",
  }}>
    <p>© {new Date().getFullYear()} <span className="gradient-text" style={{ fontWeight: 600 }}>Text-to-Learn</span>. AI-Powered Learning.</p>
  </footer>
);

export default Footer;
