function Topbar({ user, onLogout, notifications, onMarkAllRead, setActive }) {
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [loginPopup, setLoginPopup] = React.useState(null); // ✅ NEW

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const popupShownRef = React.useRef(false); // prevents re-showing on every poll

  React.useEffect(() => {
    if (popupShownRef.current) return; // already shown once, skip
    if (notifications.length === 0) return; // data not loaded yet, skip

    const firstUnread = notifications.find((n) => !n.isRead);
    if (firstUnread) {
      popupShownRef.current = true; // mark as shown
      setLoginPopup(firstUnread);
      const timer = setTimeout(() => setLoginPopup(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [notifications]); // ← watches notifications, triggers when data arrives

  function handleBellClick() {
    setShowDropdown((prev) => !prev);
    if (unreadCount > 0) onMarkAllRead();
  }

  // ✅ NEW: Click popup → go to Lost & Found
  function handlePopupClick() {
    fetch(
      `https://bracu-bus-portal.onrender.com/api/notifications/${loginPopup._id}/read`,
      {
        method: "PATCH",
      },
    ).catch((err) => console.log(err));
    setLoginPopup(null);
    setActive("Lost & Found"); // navigates to Lost & Found page
  }

  function timeAgo(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  return (
    <div className="topbar">
      {/* ✅ NEW: Login popup — appears automatically on login */}
      {loginPopup && (
        <div className="login-popup-notification" onClick={handlePopupClick}>
          <span className="popup-icon">🔍</span>
          <div className="popup-text">
            <strong>Match Found!</strong>
            <p>{loginPopup.message}</p>
          </div>
          <button
            className="popup-close"
            onClick={(e) => {
              e.stopPropagation();
              setLoginPopup(null);
            }}
          >
            ✕
          </button>
        </div>
      )}

      <div className="topbar-title">Student Profile</div>
      <div className="topbar-right">
        <div className="notif-wrapper">
          <button className="notif-btn" onClick={handleBellClick}>
            🔔
            {unreadCount > 0 && (
              <span className="notif-badge">{unreadCount}</span>
            )}
          </button>

          {showDropdown && (
            <div className="notif-dropdown">
              <div className="notif-dropdown-header">
                <span>Notifications</span>
                <button
                  className="notif-close-btn"
                  onClick={() => setShowDropdown(false)}
                >
                  ✕
                </button>
              </div>

              {notifications.length === 0 ? (
                <div className="notif-empty">No notifications yet.</div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`notif-item ${n.isRead ? "read" : "unread"}`}
                    // ✅ Also make bell-panel items clickable
                    onClick={() => {
                      setShowDropdown(false);
                      setActive("Lost & Found");
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="notif-msg">🔍 {n.message}</div>
                    <div className="notif-time">{timeAgo(n.createdAt)}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
        <div className="avatar"></div>
      </div>
    </div>
  );
}
