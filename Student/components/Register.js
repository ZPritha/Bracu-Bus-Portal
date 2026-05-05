function Register({ onSwitchToLogin, onRegisterSuccess }) {
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    student_id: "",
    phone: "",
  });
  const [msg, setMsg] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch(
        "https://bracu-bus-portal.onrender.com/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      const data = await res.json();
      if (data.success) {
        setMsg("✅ Registered! You can now login.");
      } else {
        setMsg("❌ " + data.error);
      }
    } catch (err) {
      setMsg("❌ Server error");
    }
    setLoading(false);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">🚌</div>
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-sub">Bracu Bus Portal</p>

        <input
          className="auth-input"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
        />
        <input
          className="auth-input"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        <input
          className="auth-input"
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />
        <input
          className="auth-input"
          name="phone"
          placeholder="Phone Number"
          value={form.phone}
          onChange={handleChange}
        />

        <select
          className="auth-input"
          name="role"
          value={form.role}
          onChange={handleChange}
        >
          <option value="student">Student</option>
          <option value="admin">Admin</option>
        </select>

        {form.role === "student" && (
          <input
            className="auth-input"
            name="student_id"
            placeholder="Student ID"
            value={form.student_id}
            onChange={handleChange}
          />
        )}

        {msg && <p className="auth-msg">{msg}</p>}

        <button className="auth-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="auth-switch">
          Already have an account? <span onClick={onSwitchToLogin}>Login</span>
        </p>
      </div>
    </div>
  );
}
