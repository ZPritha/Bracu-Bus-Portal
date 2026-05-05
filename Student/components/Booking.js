function Booking({ setActive, fare, plan, currentUser }) {
  const [schedule, setSchedule] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [selectedPickup, setSelectedPickup] = React.useState(null);
  const [selectedDeparture, setSelectedDeparture] = React.useState(null);
  const [paymentMethod, setPaymentMethod] = React.useState(null);
  const [confirmed, setConfirmed] = React.useState(false);
  const [waitlisted, setWaitlisted] = React.useState(false);
  const [waitlistEntry, setWaitlistEntry] = React.useState(null);
  const [paying, setPaying] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const isRoundTrip = plan === "Round Trip";

  React.useEffect(() => {
    if (!currentUser?.plan_stoppage_id) {
      setLoading(false);
      return;
    }
    fetch(
      `https://bracu-bus-portal.onrender.com/api/schedules/${currentUser.plan_stoppage_id}`,
    )
      .then((res) => res.json())
      .then((data) => {
        setSchedule(data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  const pickupSlots = schedule?.first_pickup_time
    ? [
        `1st: ${schedule.first_pickup_time}`,
        `2nd: ${schedule.second_pickup_time}`,
      ]
    : [];

  const departureSlots = schedule?.first_departure_time
    ? [
        `1st: ${schedule.first_departure_time}`,
        `2nd: ${schedule.second_departure_time}`,
      ]
    : [];

  const planLabel =
    plan === "No Plan"
      ? `৳${fare}/Ride`
      : plan === "One Way"
        ? `৳${fare * 30}/Mo`
        : `Round • ৳${fare * 2 * 30}/Mo`;

  const getAmount = () => {
    if (plan === "No Plan") return fare;
    if (plan === "One Way") return fare * 30;
    return fare * 2 * 30;
  };

  const buildPayload = (method) => ({
    user_id: currentUser.studentId,
    plan_name: plan,
    plan_fare: fare,
    plan_stoppage_id: currentUser.plan_stoppage_id,
    plan_stoppage_name: currentUser.plan_stoppage_name,
    plan_route_id: currentUser.plan_route_id,
    plan_route_name: currentUser.plan_route_name,
    selected_pickup_time: selectedPickup ? selectedPickup.split(": ")[1] : null,
    selected_departure_time: selectedDeparture
      ? selectedDeparture.split(": ")[1]
      : null,
    payment_method: method,
    status: "confirmed",
  });

  const handleBook = async (method) => {
    setSubmitting(true);
    try {
      const response = await fetch(
        "https://bracu-bus-portal.onrender.com/api/bookings",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildPayload(method)),
        },
      );
      const data = await response.json();

      if (response.status === 202 && data.waitlisted) {
        // Added to waitlist
        setWaitlistEntry(data.waitlist);
        setWaitlisted(true);
      } else if (response.ok) {
        setPaymentMethod(method === "cash" ? "Cash" : method);
        setConfirmed(true);
      } else {
        alert("Booking failed: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      alert("Something went wrong!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOnlinePayment = async () => {
    setPaying(true);
    try {
      // Save booking first (may get waitlisted)
      const bookingRes = await fetch(
        "https://bracu-bus-portal.onrender.com/api/bookings",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildPayload("sslcommerz")),
        },
      );
      const bookingData = await bookingRes.json();

      if (bookingRes.status === 202 && bookingData.waitlisted) {
        setWaitlistEntry(bookingData.waitlist);
        setWaitlisted(true);
        setPaying(false);
        return;
      }

      if (!bookingRes.ok) {
        alert("Booking failed: " + (bookingData.message || "Unknown error"));
        setPaying(false);
        return;
      }

      // Proceed to SSLCommerz
      const res = await fetch(
        "https://bracu-bus-portal.onrender.com/api/payment/initiate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
            plan_expires_at:
              plan === "No Plan"
                ? null
                : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            amount: getAmount(),
          }),
        },
      );
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to initiate payment.");
        setPaying(false);
      }
    } catch (err) {
      alert("Payment error. Is server running?");
      setPaying(false);
    }
  };

  // ── Waitlist success screen ────────────────────────────────────────────────
  if (waitlisted && waitlistEntry) {
    return (
      <div className="content">
        <div className="confirm-card">
          <div className="confirm-emoji">⏳</div>
          <div className="confirm-title">Added to Waitlist!</div>
          <p
            style={{
              color: "#888",
              fontSize: "14px",
              marginBottom: "16px",
              textAlign: "center",
            }}
          >
            This slot is currently full. You're in the queue — we'll
            automatically book you and send a notification the moment a seat
            opens up.
          </p>
          <div className="confirm-details">
            <div className="confirm-row">
              <span className="confirm-label">Route:</span>
              <span className="confirm-value">
                {waitlistEntry.plan_route_name}
              </span>
            </div>
            <div className="confirm-row">
              <span className="confirm-label">Stoppage:</span>
              <span className="confirm-value">
                {waitlistEntry.plan_stoppage_name}
              </span>
            </div>
            <div className="confirm-row">
              <span className="confirm-label">Plan:</span>
              <span className="confirm-value">{waitlistEntry.plan_name}</span>
            </div>
            {waitlistEntry.selected_pickup_time && (
              <div className="confirm-row">
                <span className="confirm-label">Pick-up:</span>
                <span className="confirm-value">
                  {waitlistEntry.selected_pickup_time}
                </span>
              </div>
            )}
            {waitlistEntry.selected_departure_time && (
              <div className="confirm-row">
                <span className="confirm-label">Departure:</span>
                <span className="confirm-value">
                  {waitlistEntry.selected_departure_time}
                </span>
              </div>
            )}
            <div className="confirm-row">
              <span className="confirm-label">Status:</span>
              <span
                className="confirm-value"
                style={{ color: "#f59e0b", fontWeight: 800 }}
              >
                Waiting
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button
              className="proceed-btn"
              style={{ flex: 1 }}
              onClick={() => setActive("My Waitlist")}
            >
              View My Waitlist
            </button>
            <button
              className="proceed-btn"
              style={{ flex: 1, background: "#6b7280" }}
              onClick={() => setActive("Dashboard")}
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Booking confirmed screen ───────────────────────────────────────────────
  if (confirmed) {
    return (
      <div className="content">
        <div className="confirm-card">
          <div className="confirm-emoji">🎉</div>
          <div className="confirm-title">Booking Confirmed!</div>
          <div className="confirm-details">
            <div className="confirm-row">
              <span className="confirm-label">Route:</span>
              <span className="confirm-value">
                {currentUser.plan_route_name}
              </span>
            </div>
            <div className="confirm-row">
              <span className="confirm-label">Stoppage:</span>
              <span className="confirm-value">
                {currentUser.plan_stoppage_name}
              </span>
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
              <span className="confirm-value">{paymentMethod || "Cash"}</span>
            </div>
            <div className="confirm-row">
              <span className="confirm-label">Fare:</span>
              <span className="confirm-value confirm-fare">{planLabel}</span>
            </div>
          </div>
          <button
            className="proceed-btn"
            style={{ marginTop: "20px" }}
            onClick={() => setActive("Dashboard")}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loading)
    return (
      <div className="content">
        <p style={{ padding: "20px" }}>Loading schedule...</p>
      </div>
    );

  if (!currentUser?.plan_stoppage_id)
    return (
      <div className="content">
        <p style={{ padding: "20px" }}>
          ⚠️ No plan selected. Please choose a plan first.
        </p>
        <button className="proceed-btn" onClick={() => setActive("Book Seat")}>
          Go to Choose a Plan
        </button>
      </div>
    );

  return (
    <div className="content">
      <div className="booking-header">BOOKING</div>
      <div className="section-label">Select Your Slot</div>

      <div className="booking-plan-card">
        <div className="booking-plan-name">
          {currentUser.plan_stoppage_name} → BRACU
        </div>
        <div className="booking-plan-desc">
          Route: {currentUser.plan_route_name}
        </div>
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
            onClick={() =>
              setSelectedPickup(selectedPickup === slot ? null : slot)
            }
          >
            {slot}
          </button>
        ))}
      </div>
      {selectedPickup && <p className="slot-confirm">✓ {selectedPickup}</p>}

      <p className="booking-section-title">
        Return Departure Time (choose one)
      </p>
      <div className="slot-row">
        {departureSlots.map((slot) => (
          <button
            key={slot}
            className={`slot-btn ${selectedDeparture === slot ? "slot-active" : ""}`}
            disabled={!isRoundTrip && selectedPickup !== null}
            onClick={() =>
              setSelectedDeparture(selectedDeparture === slot ? null : slot)
            }
          >
            {slot}
          </button>
        ))}
      </div>
      {selectedDeparture && (
        <p className="slot-confirm">✓ {selectedDeparture}</p>
      )}

      <p className="booking-section-title">Payment Method</p>
      <div className="payment-row">
        {["bKash", "Nagad", "Cash"].map((method) => (
          <button
            key={method}
            className={`payment-btn ${paymentMethod === method ? "payment-active" : ""}`}
            onClick={() => setPaymentMethod(method)}
          >
            {method}
          </button>
        ))}
      </div>

      <p
        style={{
          fontSize: "12px",
          color: "#888",
          marginTop: "8px",
          textAlign: "center",
        }}
      >
        💡 If a slot is full, you'll automatically be added to the waitlist.
      </p>

      <div
        className="booking-actions"
        style={{ display: "flex", gap: "12px", marginTop: "20px" }}
      >
        <button
          className="proceed-btn"
          style={{ flex: 1 }}
          disabled={(!selectedPickup && !selectedDeparture) || submitting}
          onClick={() => handleBook("cash")}
        >
          {submitting ? "Processing..." : "Pay in Cash"}
        </button>

        <button
          className="proceed-btn"
          style={{
            flex: 1,
            background: "linear-gradient(135deg, #6c3bea, #e91e8c)",
            fontSize: "13px",
          }}
          disabled={(!selectedPickup && !selectedDeparture) || paying}
          onClick={handleOnlinePayment}
        >
          {paying
            ? "Redirecting..."
            : "🔒 Secured by SSLCommerz — supports bKash, Nagad, Card & more"}
        </button>
      </div>
    </div>
  );
}
