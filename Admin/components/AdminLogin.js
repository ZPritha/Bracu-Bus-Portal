function AdminLogin({ onLogin }) {
  const [form, setForm] = React.useState({ adminId: "", password: "" });
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(
        "https://bracu-bus-portal.onrender.com/api/admin/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        setLoading(false);
        return;
      }
      onLogin(data);
    } catch (err) {
      setError("Server error. Is backend running?");
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <a href="../index.html" className="login-back-link">
          ← Back to Home
        </a>
        <div className="login-logo">
          <img src="brac.png" alt="BRACU" width="50" />
          <div className="login-logo-text">
            Bracu Bus Portal
            <br />
            <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>
              Admin Panel
            </span>
          </div>
        </div>

        <h3
          style={{
            textAlign: "center",
            color: "#1e293b",
            marginBottom: "1.5rem",
          }}
        >
          Admin Login
        </h3>

        <input
          className="login-input"
          name="adminId"
          placeholder="Admin ID"
          value={form.adminId}
          onChange={handleChange}
        />
        <input
          className="login-input"
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />

        {error && (
          <p style={{ color: "red", fontSize: "0.85rem", margin: "0.5rem 0" }}>
            {error}
          </p>
        )}

        <button className="login-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? "Please wait..." : "Login"}
        </button>

        <p
          style={{
            textAlign: "center",
            fontSize: "0.8rem",
            color: "#9ca3af",
            marginTop: "1rem",
          }}
        >
          Contact system administrator for access.
        </p>
      </div>
    </div>
  );
}
