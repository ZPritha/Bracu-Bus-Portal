function AdminReports() {
  const API = 'http://localhost:9255/api';

  const [reports, setReports] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState('all');
  const [filterIssue, setFilterIssue] = React.useState('all');
  const [actioningId, setActioningId] = React.useState(null);
  const [viewImage, setViewImage] = React.useState(null);
  const [confirmModal, setConfirmModal] = React.useState(null); // { id, action }

  React.useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/reports`);
      const data = await res.json();
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Could not load reports.');
    }
    setLoading(false);
  }

  async function handleAction(id, action) {
    // action: 'accepted' or 'declined'
    setActioningId(id);
    setConfirmModal(null);
    try {
      if (action === 'declined') {
        // Delete the report
        const res = await fetch(`${API}/reports/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Delete failed');
        setReports(prev => prev.filter(r => r._id !== id));
      } else {
        // Accept: update status to 'accepted'
        const res = await fetch(`${API}/reports/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'accepted' })
        });
        if (!res.ok) throw new Error('Update failed');
        const updated = await res.json();
        setReports(prev => prev.map(r => r._id === id ? { ...r, status: updated.status } : r));
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
    setActioningId(null);
  }

  const issueTypes = ['all', 'Harassment', 'Safety Concern', 'Inappropriate Behaviour', 'Other'];

  const filtered = reports.filter(r => {
    const statusMatch = filterStatus === 'all' || r.status === filterStatus;
    const issueMatch = filterIssue === 'all' || r.issue_type === filterIssue;
    return statusMatch && issueMatch;
  });

  const counts = {
    all: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    accepted: reports.filter(r => r.status === 'accepted').length,
  };

  function statusBadge(status) {
    const map = {
      pending:  { bg: '#fff8e1', color: '#f59e0b', label: '⏳ Pending' },
      accepted: { bg: '#e8f5e9', color: '#388e3c', label: '✅ Accepted' },
      reviewed: { bg: '#e3f2fd', color: '#1976d2', label: '👁 Reviewed' },
      resolved: { bg: '#e8f5e9', color: '#388e3c', label: '✔ Resolved' },
      declined: { bg: '#fce4ec', color: '#c62828', label: '❌ Declined' },
    };
    const s = map[status] || { bg: '#f5f5f5', color: '#888', label: status };
    return (
      <span style={{
        background: s.bg, color: s.color,
        padding: '4px 12px', borderRadius: 20,
        fontSize: 12, fontWeight: 700
      }}>{s.label}</span>
    );
  }

  return (
    <div className="content">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#1a1a2e' }}>📋 Student Reports</h2>
        <p style={{ margin: '4px 0 0', color: '#666', fontSize: 14 }}>
          Review and manage all reports submitted by students
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Reports', value: counts.all, color: '#667eea', bg: '#eef2ff' },
          { label: 'Pending Review', value: counts.pending, color: '#f59e0b', bg: '#fff8e1' },
          { label: 'Accepted', value: counts.accepted, color: '#22c55e', bg: '#e8f5e9' },
        ].map(c => (
          <div key={c.label} style={{
            background: c.bg, borderRadius: 16, padding: '20px 24px',
            display: 'flex', alignItems: 'center', gap: 16,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: c.color }}>{c.value}</div>
            <div style={{ fontSize: 13, color: '#555', fontWeight: 700 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {/* Status filter tabs */}
        <div style={{ display: 'flex', gap: 8, background: '#f5f5f5', borderRadius: 12, padding: 4 }}>
          {['all', 'pending', 'accepted'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              style={{
                padding: '7px 16px', borderRadius: 10, border: 'none',
                background: filterStatus === s ? '#667eea' : 'transparent',
                color: filterStatus === s ? '#fff' : '#666',
                fontWeight: 700, fontSize: 13, cursor: 'pointer',
                fontFamily: 'Nunito, sans-serif',
                textTransform: 'capitalize'
              }}
            >
              {s === 'all' ? `All (${counts.all})` : s === 'pending' ? `Pending (${counts.pending})` : `Accepted (${counts.accepted})`}
            </button>
          ))}
        </div>

        {/* Issue type filter */}
        <select
          value={filterIssue}
          onChange={e => setFilterIssue(e.target.value)}
          style={{
            padding: '9px 14px', borderRadius: 10,
            border: '1.5px solid #e0e0e0', fontSize: 13,
            fontFamily: 'Nunito, sans-serif', background: '#fff', cursor: 'pointer'
          }}
        >
          {issueTypes.map(t => (
            <option key={t} value={t}>{t === 'all' ? 'All Issue Types' : t}</option>
          ))}
        </select>
      </div>

      {/* Content */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>Loading reports...</div>
      )}

      {error && (
        <div style={{
          background: '#fff0f0', color: '#c62828', border: '1px solid #f8bbd0',
          borderRadius: 12, padding: '14px 18px', fontSize: 14
        }}>{error}</div>
      )}

      {!loading && filtered.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: '#fff', borderRadius: 16,
          border: '2px dashed #e0e0e0', color: '#999'
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <div style={{ fontWeight: 700 }}>No reports found</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Try changing the filters</div>
        </div>
      )}

      {/* Reports Table */}
      {!loading && filtered.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #ebebeb' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fafafa' }}>
                {['#', 'Student ID', 'Issue Type', 'Bus', 'Route', 'Description', 'Image', 'Date', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '12px 14px', textAlign: 'left',
                    fontSize: 11, fontWeight: 700, color: '#999',
                    textTransform: 'uppercase', letterSpacing: 0.5,
                    borderBottom: '1px solid #f0f0f0'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r._id} style={{ borderBottom: '1px solid #f5f5f5', background: i % 2 === 0 ? '#fff' : '#fafafe' }}>
                  <td style={td}>{i + 1}</td>

                  <td style={td}>
                    <span style={{
                      background: '#eef2ff', color: '#5c6bc0',
                      padding: '3px 10px', borderRadius: 20,
                      fontSize: 12, fontWeight: 700
                    }}>{r.student_id}</span>
                  </td>

                  <td style={td}>
                    <span style={{
                      background: '#fce4ec', color: '#c62828',
                      padding: '3px 10px', borderRadius: 20,
                      fontSize: 12, fontWeight: 700
                    }}>{r.issue_type}</span>
                  </td>

                  <td style={td}>{r.bus?.bus_number || '—'}</td>
                  <td style={td}>{r.route?.route_name || '—'}</td>

                  <td style={{ ...td, maxWidth: 200 }}>
                    <div style={{
                      fontSize: 13, color: '#444',
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>{r.description}</div>
                  </td>

                  <td style={td}>
                    {r.image_url ? (
                      <img
                        src={`${API.replace('/api', '')}${r.image_url}`}
                        onClick={() => setViewImage(`${API.replace('/api', '')}${r.image_url}`)}
                        style={{
                          width: 44, height: 44, objectFit: 'cover',
                          borderRadius: 8, cursor: 'pointer',
                          border: '2px solid #e0e0e0'
                        }}
                        alt="evidence"
                      />
                    ) : <span style={{ color: '#ccc', fontSize: 13 }}>—</span>}
                  </td>

                  <td style={{ ...td, fontSize: 12, color: '#888', whiteSpace: 'nowrap' }}>
                    {new Date(r.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>

                  <td style={td}>{statusBadge(r.status)}</td>

                  <td style={td}>
                    {r.status === 'pending' ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          disabled={actioningId === r._id}
                          onClick={() => setConfirmModal({ id: r._id, action: 'accepted', name: r.student_id })}
                          style={{
                            background: '#e8f5e9', color: '#388e3c',
                            border: '1.5px solid #c8e6c9',
                            borderRadius: 8, padding: '5px 10px',
                            fontSize: 12, fontWeight: 700, cursor: 'pointer',
                            fontFamily: 'Nunito, sans-serif'
                          }}
                        >✅ Accept</button>
                        <button
                          disabled={actioningId === r._id}
                          onClick={() => setConfirmModal({ id: r._id, action: 'declined', name: r.student_id })}
                          style={{
                            background: '#fce4ec', color: '#c62828',
                            border: '1.5px solid #f8bbd0',
                            borderRadius: 8, padding: '5px 10px',
                            fontSize: 12, fontWeight: 700, cursor: 'pointer',
                            fontFamily: 'Nunito, sans-serif'
                          }}
                        >❌ Decline</button>
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: '#aaa' }}>
                        {r.status === 'accepted' ? 'Accepted' : 'No action'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Image Lightbox */}
      {viewImage && (
        <div
          onClick={() => setViewImage(null)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2000, cursor: 'zoom-out'
          }}
        >
          <img
            src={viewImage}
            style={{ maxWidth: '85vw', maxHeight: '85vh', borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
            alt="Report evidence"
          />
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModal && (
        <div
          onClick={() => setConfirmModal(null)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, backdropFilter: 'blur(3px)'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 20, padding: 32,
              maxWidth: 380, width: '100%', textAlign: 'center',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>
              {confirmModal.action === 'accepted' ? '✅' : '❌'}
            </div>
            <h3 style={{ margin: '0 0 8px', fontWeight: 800, fontSize: 18 }}>
              {confirmModal.action === 'accepted' ? 'Accept Report?' : 'Decline Report?'}
            </h3>
            <p style={{ color: '#666', margin: '0 0 8px', fontSize: 14 }}>
              Report by <strong>{confirmModal.name}</strong>
            </p>
            <p style={{ color: '#999', margin: '0 0 24px', fontSize: 13 }}>
              {confirmModal.action === 'accepted'
                ? "The student's report status will change to Accepted."
                : 'This report will be permanently removed.'}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={() => setConfirmModal(null)}
                style={{
                  background: '#f5f5f5', color: '#444',
                  border: '1.5px solid #e0e0e0', borderRadius: 10,
                  padding: '10px 20px', fontWeight: 700, fontSize: 14,
                  cursor: 'pointer', fontFamily: 'Nunito, sans-serif'
                }}
              >Cancel</button>
              <button
                onClick={() => handleAction(confirmModal.id, confirmModal.action)}
                style={{
                  background: confirmModal.action === 'accepted'
                    ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                    : 'linear-gradient(135deg, #f87171, #dc2626)',
                  color: '#fff', border: 'none', borderRadius: 10,
                  padding: '10px 24px', fontWeight: 700, fontSize: 14,
                  cursor: 'pointer', fontFamily: 'Nunito, sans-serif'
                }}
              >
                {confirmModal.action === 'accepted' ? 'Yes, Accept' : 'Yes, Decline'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const td = {
  padding: '12px 14px',
  fontSize: 13,
  verticalAlign: 'middle'
};