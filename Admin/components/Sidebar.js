function Sidebar({ active, setActive }) {
  const items = [
    { icon: "🏠︎", label: "Dashboard" },
    { icon: "🛣", label: "Routes" },
    { icon: "📆", label: "Schedules" },
    { icon: "📋", label: "Bookings" },
    { icon: "🎁", label: "Lost & Found" },
    { icon: "💬", label: "Feedback" },
    { icon: "📊", label: "Reports" }
  ];
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-circle"><img src="brac.png" width="34"/></div>
        <div className="logo-text">Bracu Bus<br/>Portal</div>
      </div>
      {items.map(item => (
        <div
          key={item.label}
          className={`nav-item ${active === item.label ? "active" : ""}`}
          onClick={() => setActive(item.label)}
        >
          <span className="nav-icon">{item.icon}</span>
          {item.label}
        </div>
      ))}
    </div>
  );
}