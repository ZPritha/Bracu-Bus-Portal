function AdminBookings() {
  const [bookings, setBookings] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [filterPayment, setFilterPayment] = React.useState('all');
  const [filterStatus, setFilterStatus] = React.useState('all');
  const [updatingId, setUpdatingId] = React.useState(null);

  React.useEffect(() => {
    fetch('http://localhost:9255/api/bookings')
      .then(res => res.json())
      .then(data => { setBookings(data); setLoading(false); })
      .catch(err => { console.log(err); setLoading(false); });
  }, []);

  const handleTogglePayment = async (booking) => {
    const newStatus = booking.payment_status === 'pending' ? 'paid' : 'pending';
    setUpdatingId(booking._id);
    try {
      const res = await fetch(`http://localhost:9255/api/bookings/${booking._id}/payment-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_status: newStatus })
      });
      const updated = await res.json();
      if (res.ok) {
        setBookings(prev => prev.map(b => b._id === updated._id ? updated : b));
      } else {
        alert('Failed to update: ' + updated.message);
      }
    } catch (err) {
      alert('Error updating payment status.');
    }
    setUpdatingId(null);
  };

  const filtered = bookings.filter(b => {
    const matchSearch = !search ||
      b.user_id?.toLowerCase().includes(search.toLowerCase()) ||
      b.plan_route_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.plan_stoppage_name?.toLowerCase().includes(search.toLowerCase());
    const matchPayment = filterPayment === 'all' || b.payment_status === filterPayment;
    const matchStatus = filterStatus === 'all' || b.status === filterStatus;
    return matchSearch && matchPayment && matchStatus;
  });

  const fmt = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-BD', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const fmtDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-BD', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    pending: bookings.filter(b => b.payment_status === 'pending').length,
    paid: bookings.filter(b => b.payment_status === 'paid').length,
  };

  return (
    <div className="content">
      <div className="section-label">All Bookings</div>

      {/* Stats Row */}
      <div style={{ display: 'flex', gap: '14px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { label: 'Total', value: stats.total, color: '#6c63ff' },
          { label: 'Confirmed', value: stats.confirmed, color: '#2e7d32' },
          { label: 'Payment Pending', value: stats.pending, color: '#e65100' },
          { label: 'Paid', value: stats.paid, color: '#1565c0' },
        ].map(s => (
          <div key={s.label} style={{
            background: '#fff', borderRadius: '14px', padding: '14px 22px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.07)', flex: '1', minWidth: '120px',
            borderLeft: `4px solid ${s.color}`
          }}>
            <div style={{ fontSize: '22px', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="🔍 Search by student ID, route, stoppage..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 2, minWidth: '200px', padding: '9px 14px',
            borderRadius: '10px', border: '1.5px solid #e0e0e0',
            fontSize: '13px', outline: 'none', fontFamily: 'inherit'
          }}
        />
        <select
          value={filterPayment}
          onChange={e => setFilterPayment(e.target.value)}
          style={{
            flex: 1, minWidth: '140px', padding: '9px 12px',
            borderRadius: '10px', border: '1.5px solid #e0e0e0',
            fontSize: '13px', fontFamily: 'inherit', cursor: 'pointer'
          }}
        >
          <option value="all">All Payment Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{
            flex: 1, minWidth: '140px', padding: '9px 12px',
            borderRadius: '10px', border: '1.5px solid #e0e0e0',
            fontSize: '13px', fontFamily: 'inherit', cursor: 'pointer'
          }}
        >
          <option value="all">All Booking Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading && <p style={{ padding: '20px', color: '#888' }}>Loading bookings...</p>}

      {!loading && filtered.length === 0 && (
        <p style={{ padding: '20px', color: '#aaa', textAlign: 'center' }}>No bookings found.</p>
      )}

      {!loading && filtered.length > 0 && (
        <div style={{ overflowX: 'auto', borderRadius: '14px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f5f3ff', color: '#5e35b1' }}>
                {['Student ID', 'Route', 'Stoppage', 'Plan', 'Fare', 'Pick-up', 'Departure',
                  'Method', 'Payment Status', 'Arrival', 'Booking Status', 'Date'].map(h => (
                  <th key={h} style={{
                    padding: '11px 14px', textAlign: 'left',
                    fontWeight: 700, whiteSpace: 'nowrap',
                    borderBottom: '2px solid #ede9fe'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, i) => (
                <tr key={b._id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#333' }}>{b.user_id || '—'}</td>
                  <td style={{ padding: '10px 14px', color: '#555' }}>{b.plan_route_name || '—'}</td>
                  <td style={{ padding: '10px 14px', color: '#555' }}>{b.plan_stoppage_name || '—'}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{
                      background: '#ede9fe', color: '#6c3bea',
                      borderRadius: '8px', padding: '2px 9px', fontSize: '12px', fontWeight: 700
                    }}>{b.plan_name || '—'}</span>
                  </td>
                  <td style={{ padding: '10px 14px', fontWeight: 700, color: '#2e7d32' }}>
                    {b.plan_fare ? `৳${b.plan_fare}` : '—'}
                  </td>
                  <td style={{ padding: '10px 14px', color: '#555' }}>{b.selected_pickup_time || '—'}</td>
                  <td style={{ padding: '10px 14px', color: '#555' }}>{b.selected_departure_time || '—'}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{
                      background: b.payment_method === 'cash' ? '#fff3e0' : '#e3f2fd',
                      color: b.payment_method === 'cash' ? '#e65100' : '#1565c0',
                      borderRadius: '8px', padding: '2px 9px', fontSize: '12px', fontWeight: 600
                    }}>{b.payment_method || '—'}</span>
                  </td>

                  {/* Payment Status — clickable toggle */}
                  <td style={{ padding: '10px 14px' }}>
                    <button
                      disabled={updatingId === b._id || b.status === 'cancelled'}
                      onClick={() => handleTogglePayment(b)}
                      style={{
                        background: b.payment_status === 'paid' ? '#e8f5e9' : '#fff3e0',
                        color: b.payment_status === 'paid' ? '#2e7d32' : '#e65100',
                        border: `1.5px solid ${b.payment_status === 'paid' ? '#a5d6a7' : '#ffcc80'}`,
                        borderRadius: '20px', padding: '3px 12px', fontSize: '12px',
                        fontWeight: 700, cursor: b.status === 'cancelled' ? 'not-allowed' : 'pointer',
                        opacity: updatingId === b._id ? 0.5 : 1,
                        transition: 'all 0.2s', fontFamily: 'inherit'
                      }}
                      title={b.status === 'cancelled' ? 'Cannot change cancelled booking' : 'Click to toggle payment status'}
                    >
                      {updatingId === b._id ? '...' : b.payment_status === 'paid' ? '✓ Paid' : '⏳ Pending'}
                    </button>
                  </td>

                  <td style={{ padding: '10px 14px' }}>
                    <span style={{
                      background: b.arrival_status === 'arrived' ? '#e8f5e9' : '#f5f5f5',
                      color: b.arrival_status === 'arrived' ? '#2e7d32' : '#9e9e9e',
                      borderRadius: '8px', padding: '2px 9px', fontSize: '12px', fontWeight: 600
                    }}>
                      {b.arrival_status === 'arrived' ? '✅ Arrived' : '🔴 Not Arrived'}
                    </span>
                  </td>

                  <td style={{ padding: '10px 14px' }}>
                    <span style={{
                      background: b.status === 'confirmed' ? '#e8f5e9' : '#fce4ec',
                      color: b.status === 'confirmed' ? '#2e7d32' : '#c62828',
                      borderRadius: '8px', padding: '2px 9px', fontSize: '12px', fontWeight: 600
                    }}>
                      {b.status === 'confirmed' ? '✓ Confirmed' : '✗ Cancelled'}
                    </span>
                  </td>

                  <td style={{ padding: '10px 14px', color: '#888', whiteSpace: 'nowrap' }}>
                    {fmtDate(b.travel_date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p style={{ marginTop: '12px', fontSize: '12px', color: '#aaa', textAlign: 'right' }}>
        Showing {filtered.length} of {bookings.length} bookings
      </p>
    </div>
  );
}
