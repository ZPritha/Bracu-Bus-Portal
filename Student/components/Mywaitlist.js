function MyWaitlist({ currentUser, setActive }) {
  const [entries, setEntries] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [removing, setRemoving] = React.useState(null);

  React.useEffect(() => {
    fetch(`http://localhost:9255/api/bookings/waitlist/user/${currentUser.studentId}`)
      .then(res => res.json())
      .then(data => { setEntries(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(err => { console.log(err); setLoading(false); });
  }, []);

  async function handleLeaveWaitlist(id) {
    const ok = window.confirm("Leave the waitlist for this slot?");
    if (!ok) return;
    setRemoving(id);
    try {
      const res = await fetch(`http://localhost:9255/api/bookings/waitlist/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setEntries(prev => prev.filter(e => e._id !== id));
      } else {
        alert(data.message || "Could not remove from waitlist.");
      }
    } catch {
      alert("Something went wrong.");
    } finally {
      setRemoving(null);
    }
  }

  const statusColor = {
    waiting:  { bg: '#fff8e6', color: '#b45309', label: '⏳ Waiting' },
    promoted: { bg: '#e8fff0', color: '#00884a', label: '✅ Promoted to Booking' },
    expired:  { bg: '#f5f5f5', color: '#9ca3af', label: '⌛ Expired' }
  };

  return (
    <div className="content">
      <button className="back-btn" onClick={() => setActive("Dashboard")}>← Back</button>
      <div className="section-label">My Waitlist</div>

      {loading && <p style={{ color: '#888', marginTop: '20px' }}>Loading...</p>}

      {!loading && entries.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <div style={{ fontSize: '48px' }}>🕐</div>
          <p style={{ color: '#888', marginTop: '12px' }}>You're not on any waitlist.</p>
          <button
            className="proceed-btn"
            style={{ width: 'auto', padding: '10px 24px', marginTop: '16px' }}
            onClick={() => setActive("Book Seat")}
          >
            Book a Seat
          </button>
        </div>
      )}

      {!loading && entries.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          {entries.map((e, i) => {
            const s = statusColor[e.status] || statusColor.waiting;
            return (
              <div key={e._id} style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '16px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                borderLeft: `4px solid ${s.color}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontWeight: 800, fontSize: '16px', color: '#1a1a2e' }}>
                    Waitlist #{i + 1}
                  </span>
                  <span style={{
                    background: s.bg,
                    color: s.color,
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 700
                  }}>
                    {s.label}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
                  <div>
                    <span style={{ color: '#888' }}>Route:</span>
                    <span style={{ fontWeight: 700, marginLeft: '6px' }}>{e.plan_route_name || '-'}</span>
                  </div>
                  <div>
                    <span style={{ color: '#888' }}>Stoppage:</span>
                    <span style={{ fontWeight: 700, marginLeft: '6px' }}>{e.plan_stoppage_name || '-'}</span>
                  </div>
                  <div>
                    <span style={{ color: '#888' }}>Plan:</span>
                    <span style={{ fontWeight: 700, marginLeft: '6px' }}>{e.plan_name}</span>
                  </div>
                  <div>
                    <span style={{ color: '#888' }}>Fare:</span>
                    <span style={{ fontWeight: 700, marginLeft: '6px' }}>৳{e.plan_fare}</span>
                  </div>
                  {e.selected_pickup_time && (
                    <div>
                      <span style={{ color: '#888' }}>Pick-up:</span>
                      <span style={{ fontWeight: 700, marginLeft: '6px' }}>{e.selected_pickup_time}</span>
                    </div>
                  )}
                  {e.selected_departure_time && (
                    <div>
                      <span style={{ color: '#888' }}>Departure:</span>
                      <span style={{ fontWeight: 700, marginLeft: '6px' }}>{e.selected_departure_time}</span>
                    </div>
                  )}
                  <div>
                    <span style={{ color: '#888' }}>Slot Type:</span>
                    <span style={{ fontWeight: 700, marginLeft: '6px', textTransform: 'capitalize' }}>{e.slot_type}</span>
                  </div>
                  <div>
                    <span style={{ color: '#888' }}>Joined:</span>
                    <span style={{ fontWeight: 700, marginLeft: '6px' }}>
                      {new Date(e.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {e.status === 'promoted' && (
                  <div style={{
                    marginTop: '12px',
                    background: '#e8fff0',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    fontSize: '13px',
                    color: '#00884a',
                    fontWeight: 600
                  }}>
                    🎉 A seat opened up and you were automatically booked! Check <strong>My Bookings</strong> for your ticket.
                  </div>
                )}

                {e.status === 'waiting' && (
                  <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      className="proceed-btn"
                      style={{ width: 'auto', padding: '10px 18px', background: '#e53935', fontSize: '13px' }}
                      disabled={removing === e._id}
                      onClick={() => handleLeaveWaitlist(e._id)}
                    >
                      {removing === e._id ? 'Removing...' : 'Leave Waitlist'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}