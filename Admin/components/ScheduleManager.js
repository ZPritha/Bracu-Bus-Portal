function ScheduleManager() {
  const API = 'http://localhost:9255/api';

  const [schedules, setSchedules] = React.useState([]);
  const [routes, setRoutes] = React.useState([]);
  const [stoppages, setStoppages] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [showModal, setShowModal] = React.useState(false);
  const [editingSchedule, setEditingSchedule] = React.useState(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState(null);
  const [saving, setSaving] = React.useState(false);
  const [filterRoute, setFilterRoute] = React.useState('');

  const emptyForm = {
    route_id: '',
    stoppage_id: '',
    first_pickup_time: '',
    second_pickup_time: '',
    first_departure_time: '',
    second_departure_time: ''
  };
  const [form, setForm] = React.useState(emptyForm);

  // Fetch all data on mount
  React.useEffect(() => {
    fetchAll();
  }, []);

  // When route changes in form, fetch stoppages for that route
  React.useEffect(() => {
    if (form.route_id) {
      fetch(`${API}/stoppages`)
        .then(r => r.json())
        .then(data => {
          const filtered = data.filter(s => s.route_id === form.route_id);
          setStoppages(filtered);
        })
        .catch(console.error);
    } else {
      setStoppages([]);
    }
    setForm(prev => ({ ...prev, stoppage_id: '' }));
  }, [form.route_id]);

  async function fetchAll() {
    setLoading(true);
    try {
      const [schRes, routeRes] = await Promise.all([
        fetch(`${API}/schedules/all`),
        fetch(`${API}/routes`)
      ]);
      const [schData, routeData] = await Promise.all([schRes.json(), routeRes.json()]);
      setSchedules(Array.isArray(schData) ? schData : []);
      setRoutes(Array.isArray(routeData) ? routeData : []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  function openAddModal() {
    setEditingSchedule(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEditModal(schedule) {
    setEditingSchedule(schedule);
    setForm({
      route_id: schedule.route_id?._id || schedule.route_id,
      stoppage_id: schedule.stoppage_id?._id || schedule.stoppage_id,
      first_pickup_time: schedule.first_pickup_time,
      second_pickup_time: schedule.second_pickup_time,
      first_departure_time: schedule.first_departure_time,
      second_departure_time: schedule.second_departure_time
    });
    // Load stoppages for this route
    fetch(`${API}/stoppages`)
      .then(r => r.json())
      .then(data => {
        const routeId = schedule.route_id?._id || schedule.route_id;
        setStoppages(data.filter(s => s.route_id === routeId));
      });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingSchedule(null);
    setForm(emptyForm);
    setStoppages([]);
  }

  async function handleSave() {
    const { route_id, stoppage_id, first_pickup_time, second_pickup_time, first_departure_time, second_departure_time } = form;
    if (!route_id || !stoppage_id || !first_pickup_time || !second_pickup_time || !first_departure_time || !second_departure_time) {
      alert('Please fill in all fields.');
      return;
    }
    setSaving(true);
    try {
      const url = editingSchedule
        ? `${API}/schedules/${editingSchedule._id}`
        : `${API}/schedules`;
      const method = editingSchedule ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Save failed');
      }
      await fetchAll();
      closeModal();
    } catch (err) {
      alert('Error saving schedule: ' + err.message);
    }
    setSaving(false);
  }

  async function handleDelete(id) {
    try {
      const res = await fetch(`${API}/schedules/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setSchedules(prev => prev.filter(s => s._id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      alert('Error deleting: ' + err.message);
    }
  }

  // Filter schedules by route
  const displayed = filterRoute
    ? schedules.filter(s => (s.route_id?._id || s.route_id) === filterRoute)
    : schedules;

  // Group by route name for display
  const grouped = displayed.reduce((acc, s) => {
    const routeName = s.route_id?.route_name || 'Unknown Route';
    if (!acc[routeName]) acc[routeName] = [];
    acc[routeName].push(s);
    return acc;
  }, {});

  return (
    <div className="content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#1a1a2e' }}>📆 Schedules</h2>
          <p style={{ margin: '4px 0 0', color: '#666', fontSize: 14 }}>
            Manage pickup & departure times for each route and stoppage
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <select
            value={filterRoute}
            onChange={e => setFilterRoute(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="">All Routes</option>
            {routes.map(r => (
              <option key={r._id} value={r._id}>{r.route_name}</option>
            ))}
          </select>
          <button onClick={openAddModal} style={styles.addBtn}>
            + Add Schedule
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={styles.emptyState}>Loading schedules...</div>
      ) : displayed.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📆</div>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#444' }}>No schedules yet</div>
          <div style={{ color: '#999', marginTop: 4 }}>Click "Add Schedule" to create one</div>
        </div>
      ) : (
        Object.entries(grouped).map(([routeName, items]) => (
          <div key={routeName} style={styles.routeGroup}>
            <div style={styles.routeGroupHeader}>🛣 {routeName}</div>
            <table style={styles.table}>
              <thead>
                <tr>
                  {['Stoppage', '1st Pickup', '2nd Pickup', '1st Departure', '2nd Departure', 'Actions'].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((s, i) => (
                  <tr key={s._id} style={{ background: i % 2 === 0 ? '#fff' : '#f9f9ff' }}>
                    <td style={styles.td}>
                      <span style={styles.stoppageBadge}>
                        {s.stoppage_id?.stoppage_name || 'Unknown'}
                      </span>
                    </td>
                    <td style={styles.td}><span style={styles.timeBadge('pickup')}>{s.first_pickup_time}</span></td>
                    <td style={styles.td}><span style={styles.timeBadge('pickup')}>{s.second_pickup_time}</span></td>
                    <td style={styles.td}><span style={styles.timeBadge('depart')}>{s.first_departure_time}</span></td>
                    <td style={styles.td}><span style={styles.timeBadge('depart')}>{s.second_departure_time}</span></td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => openEditModal(s)} style={styles.editBtn}>✏️ Edit</button>
                        <button onClick={() => setDeleteConfirm(s._id)} style={styles.deleteBtn}>🗑 Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={styles.overlay} onClick={closeModal}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>
                {editingSchedule ? '✏️ Edit Schedule' : '➕ Add Schedule'}
              </h3>
              <button onClick={closeModal} style={styles.closeBtn}>✕</button>
            </div>

            <div style={styles.modalBody}>
              {/* Route Select */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Route</label>
                <select
                  value={form.route_id}
                  onChange={e => setForm(prev => ({ ...prev, route_id: e.target.value }))}
                  style={styles.select}
                >
                  <option value="">-- Select Route --</option>
                  {routes.map(r => (
                    <option key={r._id} value={r._id}>{r.route_name}</option>
                  ))}
                </select>
              </div>

              {/* Stoppage Select */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Stoppage</label>
                <select
                  value={form.stoppage_id}
                  onChange={e => setForm(prev => ({ ...prev, stoppage_id: e.target.value }))}
                  style={styles.select}
                  disabled={!form.route_id}
                >
                  <option value="">
                    {form.route_id ? (stoppages.length ? '-- Select Stoppage --' : 'No stoppages for this route') : '-- Select a route first --'}
                  </option>
                  {stoppages.map(s => (
                    <option key={s._id} value={s._id}>{s.stoppage_name}</option>
                  ))}
                </select>
              </div>

              {/* Time Inputs */}
              <div style={styles.timeGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>🟢 1st Pickup Time</label>
                  <input
                    type="time"
                    value={form.first_pickup_time}
                    onChange={e => setForm(prev => ({ ...prev, first_pickup_time: e.target.value }))}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>🟢 2nd Pickup Time</label>
                  <input
                    type="time"
                    value={form.second_pickup_time}
                    onChange={e => setForm(prev => ({ ...prev, second_pickup_time: e.target.value }))}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>🔴 1st Departure Time</label>
                  <input
                    type="time"
                    value={form.first_departure_time}
                    onChange={e => setForm(prev => ({ ...prev, first_departure_time: e.target.value }))}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>🔴 2nd Departure Time</label>
                  <input
                    type="time"
                    value={form.second_departure_time}
                    onChange={e => setForm(prev => ({ ...prev, second_departure_time: e.target.value }))}
                    style={styles.input}
                  />
                </div>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button onClick={closeModal} style={styles.cancelBtn}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={styles.saveBtn}>
                {saving ? 'Saving...' : editingSchedule ? 'Update Schedule' : 'Save Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div style={styles.overlay} onClick={() => setDeleteConfirm(null)}>
          <div style={{ ...styles.modal, maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '28px', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🗑️</div>
              <h3 style={{ margin: '0 0 8px', fontWeight: 800 }}>Delete Schedule?</h3>
              <p style={{ color: '#666', margin: '0 0 24px' }}>This action cannot be undone.</p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button onClick={() => setDeleteConfirm(null)} style={styles.cancelBtn}>Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm)} style={{ ...styles.saveBtn, background: '#e74c3c' }}>
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  addBtn: {
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '10px 20px',
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
    fontFamily: 'Nunito, sans-serif'
  },
  filterSelect: {
    padding: '9px 14px',
    borderRadius: 10,
    border: '1.5px solid #e0e0e0',
    fontSize: 14,
    fontFamily: 'Nunito, sans-serif',
    background: '#fff',
    cursor: 'pointer'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#999',
    background: '#fff',
    borderRadius: 16,
    border: '2px dashed #e0e0e0'
  },
  routeGroup: {
    marginBottom: 28,
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
    border: '1px solid #ebebeb'
  },
  routeGroupHeader: {
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: '#fff',
    padding: '12px 20px',
    fontWeight: 800,
    fontSize: 15
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    background: '#fff'
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: 12,
    fontWeight: 700,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottom: '1px solid #f0f0f0',
    background: '#fafafa'
  },
  td: {
    padding: '12px 16px',
    fontSize: 14,
    borderBottom: '1px solid #f5f5f5'
  },
  stoppageBadge: {
    background: '#eef2ff',
    color: '#5c6bc0',
    padding: '4px 10px',
    borderRadius: 20,
    fontWeight: 700,
    fontSize: 13
  },
  timeBadge: (type) => ({
    background: type === 'pickup' ? '#e8f5e9' : '#fce4ec',
    color: type === 'pickup' ? '#388e3c' : '#c62828',
    padding: '4px 10px',
    borderRadius: 20,
    fontWeight: 700,
    fontSize: 13
  }),
  editBtn: {
    background: '#fff3e0',
    color: '#e65100',
    border: '1.5px solid #ffe0b2',
    borderRadius: 8,
    padding: '5px 12px',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'Nunito, sans-serif'
  },
  deleteBtn: {
    background: '#fce4ec',
    color: '#c62828',
    border: '1.5px solid #f8bbd0',
    borderRadius: 8,
    padding: '5px 12px',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'Nunito, sans-serif'
  },
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(3px)'
  },
  modal: {
    background: '#fff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 540,
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    overflow: 'hidden'
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #f0f0f0',
    background: 'linear-gradient(135deg, #667eea11, #764ba211)'
  },
  modalBody: {
    padding: '24px'
  },
  modalFooter: {
    display: 'flex', justifyContent: 'flex-end', gap: 12,
    padding: '16px 24px',
    borderTop: '1px solid #f0f0f0',
    background: '#fafafa'
  },
  closeBtn: {
    background: 'none', border: 'none', fontSize: 18,
    cursor: 'pointer', color: '#999', lineHeight: 1
  },
  formGroup: {
    marginBottom: 16
  },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 700,
    color: '#555',
    marginBottom: 6
  },
  select: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 10,
    border: '1.5px solid #e0e0e0',
    fontSize: 14,
    fontFamily: 'Nunito, sans-serif',
    background: '#fafafa',
    cursor: 'pointer',
    boxSizing: 'border-box'
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 10,
    border: '1.5px solid #e0e0e0',
    fontSize: 14,
    fontFamily: 'Nunito, sans-serif',
    background: '#fafafa',
    boxSizing: 'border-box'
  },
  timeGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0 16px'
  },
  cancelBtn: {
    background: '#f5f5f5',
    color: '#444',
    border: '1.5px solid #e0e0e0',
    borderRadius: 10,
    padding: '10px 20px',
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
    fontFamily: 'Nunito, sans-serif'
  },
  saveBtn: {
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '10px 24px',
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
    fontFamily: 'Nunito, sans-serif'
  }
};