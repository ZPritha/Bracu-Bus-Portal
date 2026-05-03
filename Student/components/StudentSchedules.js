function StudentSchedules() {
  const API = 'http://localhost:9255/api';
  const [schedules, setSchedules] = React.useState([]);
  const [routes, setRoutes] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [filterRoute, setFilterRoute] = React.useState('');

  React.useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    setError(null);
    try {
      const [schRes, routeRes] = await Promise.all([
        fetch(`${API}/schedules/all`),
        fetch(`${API}/routes`)
      ]);
      const [schData, routeData] = await Promise.all([schRes.json(), routeRes.json()]);
      setSchedules(Array.isArray(schData) ? schData : []);
      setRoutes(Array.isArray(routeData) ? routeData : []);
    } catch (err) {
      setError('Failed to load schedules. Please try again.');
    }
    setLoading(false);
  }

  function formatTime(t) {
    if (!t) return '—';
    // If already in "8:00 AM" format, return as-is
    if (/[aApP][mM]/.test(t)) return t;
    // Convert HH:MM (24h) to 12h
    const [h, m] = t.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return t;
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
  }

  const displayed = filterRoute
    ? schedules.filter(s => (s.route_id?._id || s.route_id) === filterRoute)
    : schedules;

  const grouped = displayed.reduce((acc, s) => {
    const key = s.route_id?._id || s.route_id || 'unknown';
    const name = s.route_id?.route_name || 'Unknown Route';
    const num  = s.route_id?.route_number || '';
    if (!acc[key]) acc[key] = { name, num, items: [] };
    acc[key].items.push(s);
    return acc;
  }, {});

  return (
    <div className="content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="section-label">Bus Schedules</div>
          <p style={{ margin: '0 0 0', color: '#888', fontSize: 14 }}>
            View pickup &amp; departure times for all routes
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={filterRoute}
            onChange={e => setFilterRoute(e.target.value)}
            style={{
              padding: '9px 14px',
              borderRadius: 10,
              border: '1.5px solid #d0dff0',
              fontSize: 14,
              fontFamily: 'Nunito, sans-serif',
              background: '#fff',
              color: '#333',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            <option value="">All Routes</option>
            {routes.map(r => (
              <option key={r._id} value={r._id}>{r.route_number ? `${r.route_number} — ` : ''}{r.route_name}</option>
            ))}
          </select>
          <button
            onClick={fetchAll}
            style={{
              padding: '9px 16px',
              borderRadius: 10,
              border: '1.5px solid #d0dff0',
              background: '#fff',
              fontFamily: 'Nunito, sans-serif',
              fontSize: 14,
              fontWeight: 700,
              color: '#0077cc',
              cursor: 'pointer'
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* States */}
      {loading && (
        <div style={stStyles.emptyBox}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>⏳</div>
          <div style={{ fontWeight: 700, color: '#555' }}>Loading schedules...</div>
        </div>
      )}

      {!loading && error && (
        <div style={{ ...stStyles.emptyBox, borderColor: '#ffc0c0', background: '#fff5f5' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>⚠️</div>
          <div style={{ fontWeight: 700, color: '#c00' }}>{error}</div>
          <button onClick={fetchAll} style={{ marginTop: 12, padding: '8px 20px', borderRadius: 8, border: 'none', background: '#0077cc', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && displayed.length === 0 && (
        <div style={stStyles.emptyBox}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📆</div>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#444' }}>No schedules available</div>
          <div style={{ color: '#999', marginTop: 4, fontSize: 14 }}>
            {filterRoute ? 'No schedules for this route.' : 'The admin hasn\'t added any schedules yet.'}
          </div>
        </div>
      )}

      {!loading && !error && Object.entries(grouped).map(([key, { name, num, items }]) => (
        <div key={key} style={stStyles.routeCard}>
          {/* Route Header */}
          <div style={stStyles.routeHeader}>
            <span style={{ fontSize: 20 }}>🛣</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16 }}>
                {num ? `Route ${num} — ` : ''}{name}
              </div>
              <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>
                {items.length} stoppage{items.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Schedule Rows */}
          <div style={{ padding: '8px 0' }}>
            {/* Column Headers */}
            <div style={stStyles.colHeader}>
              <span style={{ flex: 1.4 }}>📍 Stoppage</span>
              <span style={{ flex: 1, textAlign: 'center' }}>🟢 1st Pickup</span>
              <span style={{ flex: 1, textAlign: 'center' }}>🟢 2nd Pickup</span>
              <span style={{ flex: 1, textAlign: 'center' }}>🔴 1st Departure</span>
              <span style={{ flex: 1, textAlign: 'center' }}>🔴 2nd Departure</span>
            </div>

            {items.map((s, i) => (
              <div
                key={s._id}
                style={{
                  ...stStyles.row,
                  background: i % 2 === 0 ? '#fff' : '#f7fbff'
                }}
              >
                <span style={{ flex: 1.4 }}>
                  <span style={stStyles.stoppageBadge}>
                    {s.stoppage_id?.stoppage_name || '—'}
                  </span>
                </span>
                <span style={{ flex: 1, textAlign: 'center' }}>
                  <span style={stStyles.pickupBadge}>{formatTime(s.first_pickup_time)}</span>
                </span>
                <span style={{ flex: 1, textAlign: 'center' }}>
                  <span style={stStyles.pickupBadge}>{formatTime(s.second_pickup_time)}</span>
                </span>
                <span style={{ flex: 1, textAlign: 'center' }}>
                  <span style={stStyles.departBadge}>{formatTime(s.first_departure_time)}</span>
                </span>
                <span style={{ flex: 1, textAlign: 'center' }}>
                  <span style={stStyles.departBadge}>{formatTime(s.second_departure_time)}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const stStyles = {
  emptyBox: {
    textAlign: 'center',
    padding: '60px 20px',
    background: '#fff',
    borderRadius: 18,
    border: '2px dashed #d0dff0',
    color: '#999'
  },
  routeCard: {
    background: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    boxShadow: '0 2px 14px rgba(0,119,204,0.08)',
    border: '1px solid #e0ecf8',
    marginBottom: 24
  },
  routeHeader: {
    background: 'linear-gradient(135deg, #30bcfd, #0077cc)',
    color: '#fff',
    padding: '14px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 12
  },
  colHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 20px',
    fontSize: 11,
    fontWeight: 700,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottom: '1px solid #f0f0f0',
    background: '#fafcff'
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    padding: '11px 20px',
    borderBottom: '1px solid #f4f8fc',
    fontSize: 14,
    transition: 'background 0.15s'
  },
  stoppageBadge: {
    background: '#e8f4ff',
    color: '#0055aa',
    padding: '4px 12px',
    borderRadius: 20,
    fontWeight: 700,
    fontSize: 13
  },
  pickupBadge: {
    background: '#e8f5e9',
    color: '#2e7d32',
    padding: '4px 10px',
    borderRadius: 20,
    fontWeight: 700,
    fontSize: 13
  },
  departBadge: {
    background: '#fce4ec',
    color: '#c62828',
    padding: '4px 10px',
    borderRadius: 20,
    fontWeight: 700,
    fontSize: 13
  }
};
