function Booking({ setActive, fare, plan, currentUser }) {
  const [schedule, setSchedule] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [selectedPickup, setSelectedPickup] = React.useState(null);
  const [selectedDeparture, setSelectedDeparture] = React.useState(null);
  const [paymentMethod, setPaymentMethod] = React.useState(null);
  const [confirmed, setConfirmed] = React.useState(false);
  const [paying, setPaying] = React.useState(false);

  const isRoundTrip = plan === "Round Trip";

  // Check payment return from SSLCommerz
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    const pplan = params.get('plan');
    if (payment === 'success') {
      setConfirmed(true);
      window.history.replaceState({}, '', window.location.pathname);
    } else if (payment === 'fail') {
      alert('❌ Payment failed. Please try again.');
      window.history.replaceState({}, '', window.location.pathname);
    } else if (payment === 'cancel') {
      alert('Payment cancelled.');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Fetch schedule
  React.useEffect(() => {
    if (!currentUser?.plan_stoppage_id) { setLoading(false); return; }
    fetch(`http://localhost:9255/api/schedules/${currentUser.plan_stoppage_id}`)
      .then(res => res.json())
      .then(data => { setSchedule(data); setLoading(false); })
      .catch(err => { console.log(err); setLoading(false); });
  }, []);

  const pickupSlots = schedule
    ? [`1st: ${schedule.first_pickup_time}`, `2nd: ${schedule.second_pickup_time}`]
    : [];

  const departureSlots = schedule
    ? [`1st: ${schedule.first_departure_time}`, `2nd: ${schedule.second_departure_time}`]
    : [];

  const planLabel = plan === "No Plan"
    ? `৳${fare}/Ride`
    : plan === "One Way"
    ? `৳${fare * 30}/Mo`
    : `Round • ৳${fare * 2 * 30}/Mo`;

  const getAmount = () => {
    if (plan === "No Plan") return fare;
    if (plan === "One Way") return fare * 30;
    return fare * 2 * 30;
  };

  // Cash payment handler
  const handleCashPayment = async () => {
    try {
      const response = await fetch("http://localhost:9255/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: currentUser.studentId,
          plan_name: plan,
          plan_fare: fare,
          plan_stoppage_id: currentUser.plan_stoppage_id,
          plan_stoppage_name: currentUser.plan_stoppage_name,
          plan_route_id: currentUser.plan_route_id,
          plan_route_name: currentUser.plan_route_name,
          selected_pickup_time: selectedPickup ? selectedPickup.split(": ")[1] : null,
          selected_departure_time: selectedDeparture ? selectedDeparture.split(": ")[1] : null,
          travel_date: new Date().toISOString().split('T')[0],
          payment_method: "cash",
          status: "confirmed"
        })
      });
      const data = await response.json();
      if (response.ok) {
        setPaymentMethod("Cash");
        setConfirmed(true);
      } else {
        alert("Booking failed: " + data.message);
      }
    } catch (err) {
      alert("Something went wrong!");
    }
  };

  // SSLCommerz payment handler (bKash/Nagad/Visa Card)
  const handleOnlinePayment = async () => {
    if (!paymentMethod) {
      alert('Please select a payment method first.');
      return;
    }
    setPaying(true);
    try {
      // Save booking first with pending status
      await fetch("http://localhost:9255/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: currentUser.studentId,
          plan_name: plan,
          plan_fare: fare,
          plan_stoppage_id: currentUser.plan_stoppage_id,
          plan_stoppage_name: currentUser.plan_stoppage_name,
          plan_route_id: currentUser.plan_route_id,
          plan_route_name: currentUser.plan_route_name,
          selected_pickup_time: selectedPickup ? selectedPickup.split(": ")[1] : null,
          selected_departure_time: selectedDeparture ? selectedDeparture.split(": ")[1] : null,
          travel_date: new Date().toISOString().split('T')[0],
          payment_method: 'sslcommerz',
          status: "confirmed"
        })
      });

      // Initiate SSLCommerz payment
      const res = await fetch('http://localhost:9255/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: currentUser.studentId,
          name: currentUser.name,
          email: currentUser.email,
          plan_name: plan,
          plan_fare: fare,
          plan_route_id: currentUser.plan_route_id,
          plan_route_name: currentUser.plan_route_name,
          plan_stoppage_id: currentUser.plan_stoppage_id,
          plan_stoppage_name: currentUser.plan_stoppage_name,
          plan_expires_at: plan === "No Plan"
            ? null
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          amount: getAmount()
        })
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Failed to initiate payment.');
        setPaying(false);
      }
    } catch (err) {
      alert('Payment error. Is server running?');
      setPaying(false);
    }
  };

  if (loading) return (
    <div className="content">
      <p style={{padding:"20px"}}>Loading schedule...</p>
    </div>
  );

  if (!currentUser?.plan_stoppage_id) return (
    <div className="content">
      <p style={{padding:"20px"}}>⚠️ No plan selected. Please choose a plan first.</p>
      <button className="proceed-btn" onClick={() => setActive("Book Seat")}>
        Go to Book Seat
      </button>
    </div>
  );

  if (confirmed) {
    return (
      <div className="content">
        <div className="confirm-card">
          <div className="confirm-emoji">🎉</div>
          <div className="confirm-title">Booking Confirmed!</div>
          <div className="confirm-details">
            <div className="confirm-row">
              <span className="confirm-label">Route:</span>
              <span className="confirm-value">{currentUser.plan_route_name}</span>
            </div>
            <div className="confirm-row">
              <span className="confirm-label">Stoppage:</span>
              <span className="confirm-value">{currentUser.plan_stoppage_name}</span>
            </div>
            <div className="confirm-row">
              <span className="confirm-label">Plan:</span>
              <span className="confirm-value">{plan}</span>
            </div>
            <div className="confirm-row">
              <span className="confirm-label">Pick-up:</span>
              <span className="confirm-value">
                {selectedPickup ? selectedPickup.split(": ")[1] : "None"}
              </span>
            </div>
            <div className="confirm-row">
              <span className="confirm-label">Departure:</span>
              <span className="confirm-value">
                {selectedDeparture ? selectedDeparture.split(": ")[1] : "None"}
              </span>
            </div>
            <div className="confirm-row">
              <span className="confirm-label">Payment:</span>
              <span className="confirm-value">{paymentMethod || "Online"}</span>
            </div>
            <div className="confirm-row">
              <span className="confirm-label">Fare:</span>
              <span className="confirm-value confirm-fare">{planLabel}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button className="proceed-btn"
              onClick={() => setActive("Dashboard")}>
              ← Back to Dashboard
            </button>
            <button className="proceed-btn"
              style={{ background: '#e8f0fe', color: '#2e86de' }}
              onClick={() => setActive("payment")}>
              View My Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="content">
      <div className="booking-header">BOOKING</div>
      <div className="section-label">Select Your Slot</div>

      <div className="booking-plan-card">
        <div className="booking-plan-name">{currentUser.plan_stoppage_name} → BRACU</div>
        <div className="booking-plan-desc">Route: {currentUser.plan_route_name}</div>
        <div className="booking-plan-desc">{planLabel}</div>
        <span className="booking-plan-badge">{plan}</span>
      </div>

      <p className="booking-section-title">Pick-up Time (choose one slot)</p>
      <div className="slot-row">
        {pickupSlots.map((slot) => (
          <button
            key={slot}
            className={`slot-btn ${selectedPickup === slot ? "slot-active" : ""}`}
            disabled={!isRoundTrip && selectedDeparture !== null}
            onClick={() => setSelectedPickup(selectedPickup === slot ? null : slot)}
          >
            {slot}
          </button>
        ))}
      </div>
      {selectedPickup && <p className="slot-confirm">✓ {selectedPickup}</p>}

      <p className="booking-section-title">Return Departure Time (choose one)</p>
      <div className="slot-row">
        {departureSlots.map((slot) => (
          <button
            key={slot}
            className={`slot-btn ${selectedDeparture === slot ? "slot-active" : ""}`}
            disabled={!isRoundTrip && selectedPickup !== null}
            onClick={() => setSelectedDeparture(selectedDeparture === slot ? null : slot)}
          >
            {slot}
          </button>
        ))}
      </div>
      {selectedDeparture && <p className="slot-confirm">✓ {selectedDeparture}</p>}

      <p className="booking-section-title">Payment Method</p>
      <div className="payment-row">
        {["bKash", "Nagad", "Visa Card", "Cash"].map(method => (
          <button
            key={method}
            className={`payment-btn ${paymentMethod === method ? "payment-active" : ""}`}
            onClick={() => setPaymentMethod(method)}
          >
            {method}
          </button>
        ))}
      </div>

      {/* Payment buttons */}
      <div className="booking-actions" style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
        {/* Online methods → SSLCommerz */}
        {(paymentMethod === 'bKash' || paymentMethod === 'Nagad' || paymentMethod === 'Visa Card') && (
          <button
            className="proceed-btn"
            disabled={(!selectedPickup && !selectedDeparture) || paying}
            onClick={handleOnlinePayment}
            style={{ flex: 1 }}
          >
            {paying
              ? 'Redirecting...'
              : `Pay ৳${getAmount()} via ${paymentMethod}`}
          </button>
        )}

        {/* Cash → direct confirmation */}
        {paymentMethod === 'Cash' && (
          <button
            className="proceed-btn"
            disabled={!selectedPickup && !selectedDeparture}
            onClick={handleCashPayment}
            style={{ flex: 1, background: '#2e7d32' }}
          >
            Confirm Cash Payment
          </button>
        )}

        {/* No method selected yet */}
        {!paymentMethod && (
          <button
            className="proceed-btn"
            disabled={true}
            style={{ flex: 1, opacity: 0.5 }}
          >
            Select a payment method above
          </button>
        )}
      </div>

      <p style={{
        textAlign: 'center',
        fontSize: '12px',
        color: '#888',
        marginTop: '10px'
      }}>
        🔒 bKash & Nagad secured by SSLCommerz
      </p>
    </div>
  );
}