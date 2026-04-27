function ActionButtons({ setActive, setShowReport }) {
  return (
    <>
      <div className="action-grid">
        <button className="action-btn btn-qr">My QR Pass</button>
        <button className="action-btn btn-book" onClick={() => setActive("Book Seat")}>Choose plan</button>
        <button className="action-btn btn-contact" onClick={() => setActive("Booking")}>Book Seat</button>
        <button className="action-btn btn-report" onClick={() => setShowReport(true)}>Report</button>
      </div>
    </>
  );
}

function StudentProfile({ currentUser }) {
  return (
    <div className="profile-card">
      <div className="profile-avatar">
        {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "S"}
      </div>
      <div className="profile-info">
        <h2 className="profile-name">{currentUser.name}</h2>
        <p className="profile-detail">🎓 {currentUser.studentId}</p>
        <p className="profile-detail">📧 {currentUser.email}</p>
        <p className="profile-detail">🏛 {currentUser.department} — {currentUser.semester}th Semester</p>
      </div>
    </div>
  );
}

function MyFeedbacks({ currentUser }) {
  const [feedbacks, setFeedbacks] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("http://localhost:9255/api/feedbacks")
      .then(res => res.json())
      .then(data => {
        const mine = data.filter(f => f.studentId === currentUser.studentId);
        setFeedbacks(mine);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="my-feedbacks">
      <h3 className="my-feedbacks-title">My Feedbacks</h3>
      {loading && <p className="empty-text">Loading...</p>}
      {!loading && feedbacks.length === 0 && (
        <p className="empty-text">You haven't submitted any feedback yet.</p>
      )}
      {feedbacks.map(f => (
        <div key={f._id} className="feedback-card">
          <div className="feedback-top">
            <div>
              <p className="feedback-meta">{f.busRoute}</p>
            </div>
            <div className="rating-badge">
              {'★'.repeat(Number(f.rating))}{'☆'.repeat(5 - Number(f.rating))}
            </div>
          </div>
          <p className="feedback-message">{f.message}</p>
        </div>
      ))}
    </div>
  );
}

function AnnouncementList({ announcements, currentUser }) {
  const [dismissed, setDismissed] = React.useState([]);

  React.useEffect(() => {
    if (!currentUser) return;
    fetch(`http://localhost:9255/api/students/${currentUser.studentId}/dismissed-announcements`)
      .then(res => res.json())
      .then(data => setDismissed(data.dismissedAnnouncements || []))
      .catch(err => console.log(err));
  }, []);

  async function handleDismiss(id) {
    try {
      await fetch(`http://localhost:9255/api/students/${currentUser.studentId}/dismiss-announcement`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ announcementId: id })
      });
      setDismissed(prev => [...prev, id]);
    } catch (err) {
      console.log(err);
    }
  }

  if (!announcements || announcements.length === 0) return null;

  function timeAgo(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(dateStr).toLocaleDateString();
  }

  const categoryLabels = {
    bus_delay:       '🚌 Bus Delay',
    route_change:    '🛑 Route Change',
    schedule_update: '⏰ Schedule Update',
    maintenance:     '🔧 Maintenance',
    safety_notice:   '⚠️ Safety Notice',
    general_notice:  '📢 General Notice',
  };

  const visible = announcements.filter(a => !dismissed.includes(a._id));

  if (visible.length === 0) return (
    <div className="announcement-card">
      <div className="announcement-card-header">
        <span>🔔</span>
        <h3>Announcements</h3>
      </div>
      <p style={{ color: '#aaa', fontSize: '13px', padding: '8px 0' }}>
        No announcements to show.
      </p>
    </div>
  );

  return (
    <div className="announcement-card">
      <div className="announcement-card-header">
        <span>🔔</span>
        <h3>Announcements</h3>
      </div>
      {visible.map(a => (
        <div className="announcement-item" key={a._id}
          style={{ position: 'relative' }}>
          <button
            onClick={() => handleDismiss(a._id)}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'none',
              border: 'none',
              fontSize: '14px',
              color: '#aaa',
              cursor: 'pointer',
              padding: '2px 6px',
              borderRadius: '50%',
            }}
            title="Dismiss"
          >✕</button>

          <div className="announcement-item-top" style={{ paddingRight: '24px' }}>
            <span className="announcement-item-title">{a.title}</span>
            <div className="announcement-badges">
              {a.category && (
                <span className="badge badge-category">
                  {categoryLabels[a.category] || a.category}
                </span>
              )}
              {a.busNumber && (
                <span className="badge badge-bus">🚌 {a.busNumber}</span>
              )}
              {a.routeName && (
                <span className="badge badge-route">📍 {a.routeName}</span>
              )}
            </div>
          </div>
          <div className="announcement-item-message">{a.message}</div>
          <div className="announcement-item-time">🕒 {timeAgo(a.createdAt)}</div>
        </div>
      ))}
    </div>
  );
}

function Dashboard({ setActive, announcements, setShowReport, currentUser }) {
  return (
    <div className="content">
      <div className="section-label">Dashboard</div>
      {currentUser && <StudentProfile currentUser={currentUser} />}
      <ActionButtons setActive={setActive} setShowReport={setShowReport} />
      <AnnouncementList announcements={announcements} currentUser={currentUser} />
      {currentUser && <MyFeedbacks currentUser={currentUser} />}
      <Weather />
      <SOSButton currentUser={currentUser} />
    </div>
  );
}