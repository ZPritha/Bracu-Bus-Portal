function SOSButton({ currentUser }) {
  const [status, setStatus] = React.useState("idle"); // idle | locating | sent | error
  const [countdown, setCountdown] = React.useState(null);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const timerRef = React.useRef(null);

  const startSOS = () => setShowConfirm(true);

  const cancelSOS = () => {
    setShowConfirm(false);
    setCountdown(null);
    clearInterval(timerRef.current);
    setStatus("idle");
  };

  const confirmSOS = () => {
    setShowConfirm(false);
    setStatus("locating");
    let count = 3;
    setCountdown(count);

    timerRef.current = setInterval(() => {
      count--;
      setCountdown(count);
      if (count === 0) {
        clearInterval(timerRef.current);
        setCountdown(null);
        sendSOS();
      }
    }, 1000);
  };

  const sendSOS = () => {
    if (!navigator.geolocation) {
      sendAlert(null, null, "Location unavailable");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const locationText = `https://maps.google.com/?q=${latitude},${longitude}`;
        sendAlert(latitude, longitude, locationText);
      },
      () => sendAlert(null, null, "Location permission denied"),
    );
  };

  const sendAlert = async (lat, lng, locationText) => {
    try {
      const res = await fetch("https://bracu-bus-portal.onrender.com/api/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: currentUser.studentId,
          student_name: currentUser.name,
          latitude: lat,
          longitude: lng,
          location_text: locationText,
        }),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
      setTimeout(() => setStatus("idle"), 5000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  return (
    <div className="sos-wrap">
      {/* Confirm Dialog */}
      {showConfirm && (
        <div className="sos-confirm">
          <p>⚠️ Send SOS alert to main office with your location?</p>
          <div className="sos-confirm-btns">
            <button className="sos-confirm-yes" onClick={confirmSOS}>
              Yes, Send SOS
            </button>
            <button className="sos-confirm-no" onClick={cancelSOS}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Countdown */}
      {countdown !== null && (
        <div className="sos-countdown">
          Sending SOS in <strong>{countdown}</strong>...
          <button className="sos-cancel-btn" onClick={cancelSOS}>
            Cancel
          </button>
        </div>
      )}

      {/* Status messages */}
      {status === "sent" && (
        <div className="sos-status success">
          ✅ SOS sent! Main office has been notified with your location.
        </div>
      )}
      {status === "error" && (
        <div className="sos-status error">
          ❌ Failed to send SOS. Please call the office directly.
        </div>
      )}

      {/* SOS Button */}
      {status === "idle" && !showConfirm && (
        <button className="sos-btn" onClick={startSOS}>
          <span className="sos-pulse"></span>
          🆘 SOS Emergency
        </button>
      )}
    </div>
  );
}
