function ActionButtons({ addAnnouncement, onDraftSaved }) {
  const [showModal, setShowModal] = React.useState(false);

  return (
    <div>
      <div className="action-grid">
        <button
          className="action-btn btn-qr"
          onClick={() => setShowModal(true)}
        >
          Create Announcement
        </button>
        <button className="action-btn btn-report">Set Up Deals</button>
      </div>

      {showModal && (
        <Announcement
          onClose={() => setShowModal(false)}
          onSubmit={(data) => {
            addAnnouncement(data.title, data.message, data._id);
            setShowModal(false);
          }}
          onDraftSaved={() => {
            onDraftSaved();
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

function AnnouncementList({ announcements, onEdit, onDelete }) {
  if (announcements.length === 0) return null;

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

  return (
    <div className="announcement-card">
      <div className="announcement-card-header">
        <span>🔔</span>
        <h3>Announcements</h3>
      </div>
      {announcements.map(a => (
        <div className="announcement-item" key={a._id}>
          <div className="announcement-item-top">
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
          <div className="announcement-item-actions">
            <button
              className="btn-edit-announcement"
              onClick={() => onEdit(a)}
            >
              ✏️ Edit
            </button>
            <button
              className="btn-delete-announcement"
              onClick={() => onDelete(a._id)}
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function DraftList({ drafts, onPublish, onDelete }) {
  if (drafts.length === 0) return null;

  const categoryLabels = {
    bus_delay:       '🚌 Bus Delay',
    route_change:    '🛑 Route Change',
    schedule_update: '⏰ Schedule Update',
    maintenance:     '🔧 Maintenance',
    safety_notice:   '⚠️ Safety Notice',
    general_notice:  '📢 General Notice',
  };

  return (
    <div className="announcement-card" style={{ marginTop: '16px' }}>
      <div className="announcement-card-header">
        <span>📝</span>
        <h3>Drafts</h3>
      </div>
      {drafts.map(d => (
        <div className="announcement-item draft-item" key={d._id}>
          <div className="announcement-item-top">
            <span className="announcement-item-title">{d.title}</span>
            <div className="announcement-badges">
              {d.category && (
                <span className="badge badge-category">
                  {categoryLabels[d.category] || d.category}
                </span>
              )}
              {d.busNumber && (
                <span className="badge badge-bus">🚌 {d.busNumber}</span>
              )}
              {d.routeName && (
                <span className="badge badge-route">📍 {d.routeName}</span>
              )}
              <span className="badge badge-draft">Draft</span>
            </div>
          </div>
          <div className="announcement-item-message">{d.message}</div>
          <div className="draft-actions">
            <button
              className="btn-publish-draft"
              onClick={() => onPublish(d._id)}
            >
              Publish
            </button>
            <button
              className="btn-delete-draft"
              onClick={() => onDelete(d._id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function Dashboard({ setActive, announcements, addAnnouncement, setAnnouncements }) {
  const [drafts, setDrafts]         = React.useState([]);
  const [editData, setEditData]     = React.useState(null);

  function fetchDrafts() {
    fetch('http://localhost:9255/api/announcements/drafts')
      .then(res => res.json())
      .then(data => setDrafts(data))
      .catch(err => console.log(err));
  }

  React.useEffect(() => {
    fetchDrafts();
  }, []);

  function handlePublishDraft(id) {
    fetch(`http://localhost:9255/api/announcements/${id}/publish`, {
      method: 'PATCH'
    })
      .then(res => res.json())
      .then(data => {
        setDrafts(prev => prev.filter(d => d._id !== id));
        addAnnouncement(data.title, data.message, data._id);
      })
      .catch(err => console.log(err));
  }

  function handleDeleteDraft(id) {
    fetch(`http://localhost:9255/api/announcements/${id}`, {
      method: 'DELETE'
    })
      .then(() => setDrafts(prev => prev.filter(d => d._id !== id)))
      .catch(err => console.log(err));
  }

  function handleDeleteAnnouncement(id) {
    if (!window.confirm('Delete this announcement?')) return;
    fetch(`http://localhost:9255/api/announcements/${id}`, {
      method: 'DELETE'
    })
      .then(() => {
        setAnnouncements(prev => prev.filter(a => a._id !== id));
      })
      .catch(err => console.log(err));
  }

  function handleEditSave(updatedData) {
    setAnnouncements(prev =>
      prev.map(a => a._id === updatedData._id ? updatedData : a)
    );
    setEditData(null);
  }

  return (
    <div className="content">
      <div className="section-label">Dashboard</div>
      <ActionButtons
        setActive={setActive}
        addAnnouncement={addAnnouncement}
        onDraftSaved={fetchDrafts}
      />
      <AnnouncementList
        announcements={announcements}
        onEdit={(a) => setEditData(a)}
        onDelete={handleDeleteAnnouncement}
      />
      <DraftList
        drafts={drafts}
        onPublish={handlePublishDraft}
        onDelete={handleDeleteDraft}
      />

      {editData && (
        <Announcement
          onClose={() => setEditData(null)}
          onSubmit={handleEditSave}
          onDraftSaved={() => {
            fetchDrafts();
            setEditData(null);
          }}
          editData={editData}
        />
      )}
    </div>
  );
}


