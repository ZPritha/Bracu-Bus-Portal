function Login({ onLogin }) {
  const [isRegister, setIsRegister] = React.useState(false);

  // Login state
  const [loginId, setLoginId] = React.useState('');
  const [loginPassword, setLoginPassword] = React.useState('');

  // Register state
  const [regId, setRegId] = React.useState('');
  const [regName, setRegName] = React.useState('');
  const [regEmail, setRegEmail] = React.useState('');
  const [regPassword, setRegPassword] = React.useState('');
  const [regDept, setRegDept] = React.useState('');
  const [regSemester, setRegSemester] = React.useState('');

  async function handleLogin() {
    if (!loginId || !loginPassword) {
      alert('Please enter Student ID and password.');
      return;
    }
    try {
      const res = await fetch('http://localhost:9255/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: loginId, password: loginPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error);
        return;
      }
      onLogin(data);
    } catch (err) {
      alert('Server error. Is backend running?');
    }
  }

  async function handleRegister() {
    if (!regId || !regName || !regEmail || !regPassword || !regDept || !regSemester) {
      alert('Please fill in all fields.');
      return;
    }
    try {
      const res = await fetch('http://localhost:9255/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: regId,
          name: regName,
          email: regEmail,
          password: regPassword,
          department: regDept,
          semester: regSemester
        })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error);
        return;
      }
      alert('Registered successfully! Please log in.');
      setIsRegister(false);
    } catch (err) {
      alert('Server error. Is backend running?');
    }
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <a href="../index.html" className="login-back-link">← Back to Home</a>

        <div className="login-logo">
          <img src="brac.png" alt="BRACU" className="login-logo-img" />
          <div className="login-logo-text">Bracu Bus Portal</div>
        </div>

        <div className="login-tabs">
          <button
            className={`login-tab ${!isRegister ? 'active' : ''}`}
            onClick={() => setIsRegister(false)}
          >
            Login
          </button>
          <button
            className={`login-tab ${isRegister ? 'active' : ''}`}
            onClick={() => setIsRegister(true)}
          >
            Register
          </button>
        </div>

        {!isRegister ? (
          <div className="login-form">
            <input
              className="login-input"
              placeholder="Student ID"
              value={loginId}
              onChange={e => setLoginId(e.target.value)}
            />
            <input
              className="login-input"
              placeholder="Password"
              type="password"
              value={loginPassword}
              onChange={e => setLoginPassword(e.target.value)}
            />
            <button className="login-btn" onClick={handleLogin}>
              Login
            </button>
          </div>
        ) : (
          <div className="login-form">
            <input
              className="login-input"
              placeholder="Student ID (e.g. 22299255)"
              value={regId}
              onChange={e => setRegId(e.target.value)}
            />
            <input
              className="login-input"
              placeholder="Full Name"
              value={regName}
              onChange={e => setRegName(e.target.value)}
            />
            <input
              className="login-input"
              placeholder="Email (e.g. id@g.bracu.ac.bd)"
              value={regEmail}
              onChange={e => setRegEmail(e.target.value)}
            />
            <input
              className="login-input"
              placeholder="Password"
              type="password"
              value={regPassword}
              onChange={e => setRegPassword(e.target.value)}
            />
            <input
              className="login-input"
              placeholder="Department (e.g. CSE)"
              value={regDept}
              onChange={e => setRegDept(e.target.value)}
            />
            <input
              className="login-input"
              placeholder="Semester (e.g. 6th)"
              value={regSemester}
              onChange={e => setRegSemester(e.target.value)}
            />
            <button className="login-btn" onClick={handleRegister}>
              Register
            </button>
          </div>
        )}

      </div>
    </div>
  );
}