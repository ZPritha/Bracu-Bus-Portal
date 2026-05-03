function MyBookings({ currentUser, setActive }) {
  const [bookings, setBookings] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch(`http://localhost:9255/api/bookings/user/${currentUser.studentId}`)
      .then(res => res.json())
      .then(data => { setBookings(data); setLoading(false); })
      .catch(err => { console.log(err); setLoading(false); });
  }, []);

  function parseLocalTimeOnDate(baseDate, timeString) {
    if (!timeString) return null;

    const timeMatch = String(timeString).trim().match(/^(\d{1,2}):(\d{2})(?:\s*([AP]M))?$/i);
    if (!timeMatch) return null;

    let hours = Number(timeMatch[1]);
    const minutes = Number(timeMatch[2]);
    const meridiem = timeMatch[3]?.toUpperCase();

    if (meridiem === 'PM' && hours !== 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;

    const date = new Date(baseDate);
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  function canCancelBooking(booking) {
    return booking.status === 'confirmed';
  }

  async function handleCancelBooking(bookingId, plan) {
    const confirmCancel = window.confirm(`Cancel this ${plan} ticket?`);
    if (!confirmCancel) return;

    try {
      const res = await fetch(`http://localhost:9255/api/bookings/${bookingId}/cancel`, {
        method: 'PATCH'
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || 'Could not cancel booking.');
        return;
      }

      setBookings(prev => prev.map(b => (b._id === bookingId ? data.booking : b)));
      alert('Ticket cancelled successfully.');
    } catch (err) {
      alert('Could not cancel booking.');
    }
  }

  return (
    <div className="content">
      <button className="back-btn" onClick={() => setActive("Dashboard")}>
        ← Back
      </button>
      <div className="section-label">My Bookings & Payments</div>

      {loading && <p style={{ color: '#888', marginTop: '20px' }}>Loading...</p>}

      {!loading && bookings.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <div style={{ fontSize: '48px' }}>🎫</div>
          <p style={{ color: '#888', marginTop: '12px' }}>No bookings yet.</p>
          <button className="proceed-btn"
            style={{ width: 'auto', padding: '10px 24px', marginTop: '16px' }}
            onClick={() => setActive("Book Seat")}>
            Book a Seat
          </button>
        </div>
      )}

      {!loading && bookings.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          {bookings.map((b, i) => (
            <div key={b._id} style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '16px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.07)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontWeight: 800, fontSize: '16px', color: '#1a1a2e' }}>
                  Booking #{i + 1}
                </span>
                <span style={{
                  background: b.status === 'confirmed' ? '#e8fff0' : '#ffe8e8',
                  color: b.status === 'confirmed' ? '#00884a' : '#cc0000',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 700
                }}>
                  {b.status === 'confirmed' ? '✅ Confirmed' : '❌ Cancelled'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
                <div>
                  <span style={{ color: '#888' }}>Plan:</span>
                  <span style={{ fontWeight: 700, marginLeft: '6px' }}>{b.plan_name}</span>
                </div>
                <div>
                  <span style={{ color: '#888' }}>Fare:</span>
                  <span style={{ fontWeight: 700, marginLeft: '6px' }}>৳{b.plan_fare}</span>
                </div>
                <div>
                  <span style={{ color: '#888' }}>Route:</span>
                  <span style={{ fontWeight: 700, marginLeft: '6px' }}>{b.plan_route_name || '-'}</span>
                </div>
                <div>
                  <span style={{ color: '#888' }}>Stoppage:</span>
                  <span style={{ fontWeight: 700, marginLeft: '6px' }}>{b.plan_stoppage_name || '-'}</span>
                </div>
                {b.selected_pickup_time && (
                  <div>
                    <span style={{ color: '#888' }}>Pick-up:</span>
                    <span style={{ fontWeight: 700, marginLeft: '6px' }}>{b.selected_pickup_time}</span>
                  </div>
                )}
                {b.selected_departure_time && (
                  <div>
                    <span style={{ color: '#888' }}>Departure:</span>
                    <span style={{ fontWeight: 700, marginLeft: '6px' }}>{b.selected_departure_time}</span>
                  </div>
                )}
                <div>
                  <span style={{ color: '#888' }}>Payment:</span>
                  <span style={{ fontWeight: 700, marginLeft: '6px', textTransform: 'capitalize' }}>
                    {b.payment_method}
                  </span>
                </div>
                <div>
                  <span style={{ color: '#888' }}>Date:</span>
                  <span style={{ fontWeight: 700, marginLeft: '6px' }}>
                    {new Date(b.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span style={{ color: '#888' }}>Arrival:</span>
                  <span style={{ 
                    fontWeight: 800, 
                    marginLeft: '6px', 
                    color: b.arrival_status === 'arrived' ? '#00884a' : '#ff9800'
                  }}>
                    {b.arrival_status === 'arrived' ? '✅ Arrived' : '⏳ Not Arrived'}
                  </span>
                </div>
              </div>

              {canCancelBooking(b) && (
                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    className="proceed-btn"
                    style={{ width: 'auto', padding: '10px 18px', background: '#e53935' }}
                    onClick={() => handleCancelBooking(b._id, b.plan_name)}
                  >
                    Cancel Booking
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}