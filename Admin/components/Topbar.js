function Topbar({ admin, onLogout }) {
  return (
    <div className="topbar">
      <div className="topbar-title">Admin Profile</div>
      <div className="topbar-right">
        <button className="notif-btn">
          🔔
          <span className="notif-badge">3</span>
        </button>
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
        <div className="avatar"></div>
      </div>
    </div>
  );
}