function ActionButtons({
  setActive,
  setShowReport,
  setShowScanner,
  currentUser,
}) {
  return (
    <>
      <div className="action-grid">
        <button
          className="action-btn btn-qr"
          onClick={() => setActive("My Waitlist")}
        >
          My Waitlist
        </button>
        <button
          className="action-btn btn-scan"
          style={{ background: "#059669" }}
          onClick={() => setShowScanner(true)}
        >
          Scan QR to Arrive
        </button>
        <button
          className="action-btn btn-book"
          onClick={() => setActive("Book Seat")}
        >
          Choose plan
        </button>
        <button
          className="action-btn btn-contact"
          onClick={() => setActive("Booking")}
        >
          Book Seat
        </button>
        <button
          className="action-btn btn-report"
          onClick={() => setShowReport(true)}
        >
          Report
        </button>
      </div>
    </>
  );
}

function StudentProfile({ currentUser }) {
  return (
    <div className="profile-card">
      <div className="profile-avatar">
        {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "S"}
      </div>
      <div className="profile-info">
        <h2 className="profile-name">{currentUser.name}</h2>
        <p className="profile-detail">🎓 {currentUser.studentId}</p>
        <p className="profile-detail">📧 {currentUser.email}</p>
        <p className="profile-detail">
          🏛 {currentUser.department} — {currentUser.semester}th Semester
        </p>
      </div>
    </div>
  );
}

function MyFeedbacks({ currentUser }) {
  const [feedbacks, setFeedbacks] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("https://bracu-bus-portal.onrender.com/api/feedbacks")
      .then((res) => res.json())
      .then((data) => {
        const mine = data.filter((f) => f.studentId === currentUser.studentId);
        setFeedbacks(mine);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="my-feedbacks">
      <h3 className="my-feedbacks-title">My Feedbacks</h3>
      {loading && <p className="empty-text">Loading...</p>}
      {!loading && feedbacks.length === 0 && (
        <p className="empty-text">You haven't submitted any feedback yet.</p>
      )}
      {feedbacks.map((f) => (
        <div key={f._id} className="feedback-card">
          <div className="feedback-top">
            <div>
              <p className="feedback-meta">{f.busRoute}</p>
              <p className="feedback-meta">{f.behaviour}</p>
            </div>
            <div className="rating-badge">
              {"★".repeat(Number(f.rating))}
              {"☆".repeat(5 - Number(f.rating))}
            </div>
          </div>
          <p className="feedback-message">{f.message}</p>
        </div>
      ))}
    </div>
  );
}

function AnnouncementList({ announcements, currentUser }) {
  const [dismissed, setDismissed] = React.useState([]);

  React.useEffect(() => {
    if (!currentUser) return;
    fetch(
      `https://bracu-bus-portal.onrender.com/api/students/${currentUser.studentId}/dismissed-announcements`,
    )
      .then((res) => res.json())
      .then((data) => setDismissed(data.dismissedAnnouncements || []))
      .catch((err) => console.log(err));
  }, []);

  async function handleDismiss(id) {
    try {
      await fetch(
        `https://bracu-bus-portal.onrender.com/api/students/${currentUser.studentId}/dismiss-announcement`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ announcementId: id }),
        },
      );
      setDismissed((prev) => [...prev, id]);
    } catch (err) {
      console.log(err);
    }
  }

  if (!announcements || announcements.length === 0) return null;

  function timeAgo(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(dateStr).toLocaleDateString();
  }

  const categoryLabels = {
    bus_delay: "🚌 Bus Delay",
    route_change: "🛑 Route Change",
    schedule_update: "⏰ Schedule Update",
    maintenance: "🔧 Maintenance",
    safety_notice: "⚠️ Safety Notice",
    general_notice: "📢 General Notice",
  };

  const visible = announcements.filter((a) => !dismissed.includes(a._id));

  if (visible.length === 0)
    return (
      <div className="announcement-card">
        <div className="announcement-card-header">
          <span>🔔</span>
          <h3>Announcements</h3>
        </div>
        <p style={{ color: "#aaa", fontSize: "13px", padding: "8px 0" }}>
          No announcements to show.
        </p>
      </div>
    );

  return (
    <div className="announcement-card">
      <div className="announcement-card-header">
        <span>🔔</span>
        <h3>Announcements</h3>
      </div>
      {visible.map((a) => (
        <div
          className="announcement-item"
          key={a._id}
          style={{ position: "relative" }}
        >
          <button
            onClick={() => handleDismiss(a._id)}
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              background: "none",
              border: "none",
              fontSize: "14px",
              color: "#aaa",
              cursor: "pointer",
              padding: "2px 6px",
              borderRadius: "50%",
            }}
            title="Dismiss"
          >
            ✕
          </button>

          <div
            className="announcement-item-top"
            style={{ paddingRight: "24px" }}
          >
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
          <div className="announcement-item-time">
            🕒 {timeAgo(a.createdAt)}
          </div>
        </div>
      ))}
    </div>
  );
}

function UpcomingBus({ currentUser }) {
  const [schedules, setSchedules] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  React.useEffect(() => {
    // Fetch all schedules and filter by student's route in the frontend
    fetch("https://bracu-bus-portal.onrender.com/api/schedules/all")
      .then((res) => res.json())
      .then((data) => {
        setSchedules(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toMinutes = (timeStr) => {
    if (!timeStr) return null;
    const clean = timeStr.trim().toUpperCase();
    let [time, period] = clean.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const userRouteId = currentUser?.plan_route_id;
  const userRouteName = currentUser?.plan_route_name;
  const userStoppageName = currentUser?.plan_stoppage_name;

  // Filter schedules that match the student's route
  const matchingSchedules = schedules.filter((s) => {
    if (!userRouteId) return false;
    const sRouteId = s.route_id?._id || s.route_id;
    return sRouteId === userRouteId;
  });

  const upcomingBuses = [];
  matchingSchedules.forEach((s) => {
    const stoppageName = s.stoppage_id?.stoppage_name || s.stoppage_name || "";

    [
      {
        label: "1st Trip",
        pickup: s.first_pickup_time,
        departure: s.first_departure_time,
      },
      {
        label: "2nd Trip",
        pickup: s.second_pickup_time,
        departure: s.second_departure_time,
      },
    ].forEach((t) => {
      const pickupMin = toMinutes(t.pickup);
      if (pickupMin !== null && pickupMin >= nowMinutes) {
        upcomingBuses.push({
          trip: t.label,
          stoppage: stoppageName,
          pickup: t.pickup,
          departure: t.departure,
          diffMinutes: pickupMin - nowMinutes,
          isUserStoppage:
            stoppageName.toLowerCase() === userStoppageName?.toLowerCase(),
        });
      }
    });
  });

  // Sort by time, and prioritize the user's specific stoppage if times are close
  upcomingBuses.sort((a, b) => {
    if (a.diffMinutes !== b.diffMinutes) return a.diffMinutes - b.diffMinutes;
    return b.isUserStoppage - a.isUserStoppage;
  });

  const formatDiff = (mins) => {
    if (mins === 0) return "Now";
    if (mins < 60) return `${mins} min`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  if (!userRouteId)
    return (
      <div className="upcoming-bus">
        <h3 className="upcoming-title">🚌 Upcoming Bus</h3>
        <p className="empty-text">
          No route selected. Please choose a plan first.
        </p>
      </div>
    );

  return (
    <div className="upcoming-bus">
      <h3 className="upcoming-title">🚌 Upcoming Bus</h3>
      <p className="upcoming-route">
        Route: <strong>{userRouteName}</strong>
        {userStoppageName && (
          <span>
            {" "}
            — Your Stop: <strong>{userStoppageName}</strong>
          </span>
        )}
      </p>
      {loading && <p className="empty-text">Loading schedules...</p>}
      {!loading && upcomingBuses.length === 0 && (
        <div className="no-bus-card">
          <span>😔</span>
          <p>No upcoming buses for today.</p>
        </div>
      )}
      {upcomingBuses.slice(0, 3).map((bus, i) => (
        <div
          key={i}
          className={`bus-card ${bus.isUserStoppage ? "bus-card-next" : ""}`}
        >
          <div className="bus-card-left">
            <div className="bus-trip-label">
              {bus.trip} {bus.isUserStoppage && "⭐ (Your Stop)"}
            </div>
            <div className="bus-stoppage">{bus.stoppage}</div>
            <div className="bus-times">
              🕐 Pickup: <strong>{bus.pickup}</strong>
              &nbsp;&nbsp;🚀 Departure: <strong>{bus.departure}</strong>
            </div>
          </div>
          <div className="bus-card-right">
            <div
              className={`bus-countdown ${bus.diffMinutes <= 10 ? "urgent" : ""}`}
            >
              {formatDiff(bus.diffMinutes)}
            </div>
            <div className="bus-countdown-label">
              {bus.diffMinutes <= 10 ? "⚠️ Hurry!" : "away"}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function LiveMap({ currentUser }) {
  const mapRef = React.useRef(null);
  const mapInstanceRef = React.useRef(null);
  const busMarkerRef = React.useRef(null);
  const [busStatus, setBusStatus] = React.useState("Loading...");

  const BRACU = { lat: 23.7807, lng: 90.4394 };

  React.useEffect(() => {
    if (mapInstanceRef.current) return;
    const map = L.map(mapRef.current).setView([BRACU.lat, BRACU.lng], 12);
    mapInstanceRef.current = map;
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);
    L.marker([BRACU.lat, BRACU.lng], {
      icon: L.divIcon({
        html: '<div style="font-size:1.5rem">🏫</div>',
        className: "",
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      }),
    })
      .addTo(map)
      .bindPopup("<strong>BRAC University</strong>");
    setTimeout(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    }, 300);
  }, []);

  React.useEffect(() => {
    if (!currentUser?.plan_route_id || !mapInstanceRef.current) return;

    async function fetchLiveLocation() {
      try {
        const res = await fetch(
          `https://bracu-bus-portal.onrender.com/api/bus-locations/${currentUser.plan_route_id}`,
        );
        const data = await res.json();

        if (!Array.isArray(data) || data.length === 0) {
          setBusStatus("🔴 No bus data available"); // ← update status
          return;
        }

        const bus = data[0];
        if (!bus.latitude || !bus.longitude) return;

        const lat = Number(bus.latitude);
        const lng = Number(bus.longitude);

        // ← update status from simulator's speed field
        const speed = bus.speed || 0;
        const lastUpdated = new Date(bus.last_updated).toLocaleTimeString();

        if (speed === 0) {
          setBusStatus(`🟡 Bus is stationary — Last updated: ${lastUpdated}`);
        } else {
          setBusStatus(
            `🟢 Bus is moving at ${speed} km/h — Last updated: ${lastUpdated}`,
          );
        }

        if (!busMarkerRef.current) {
          busMarkerRef.current = L.marker([lat, lng], {
            icon: L.divIcon({
              html: '<div style="font-size:1.8rem">🚌</div>',
              className: "",
              iconSize: [36, 36],
              iconAnchor: [18, 18],
            }),
          }).addTo(mapInstanceRef.current);
        } else {
          busMarkerRef.current.setLatLng([lat, lng]);
        }

        busMarkerRef.current.setPopupContent(`
          <strong>${bus.bus_id?.bus_number || "Bus"}</strong><br/>
          Route: ${bus.route_id?.route_name || currentUser.plan_route_name}<br/>
          Speed: ${speed} km/h<br/>
          Last Updated: ${lastUpdated}
        `);

        mapInstanceRef.current.setView([lat, lng], 13);
      } catch (error) {
        setBusStatus("🔴 Failed to fetch location");
        console.error("Failed to fetch live bus location:", error);
      }
    }

    fetchLiveLocation();
    const interval = setInterval(fetchLiveLocation, 5000);
    return () => clearInterval(interval);
  }, [currentUser?.plan_route_id]);

  return (
    <div className="live-map-wrapper">
      <h3 className="upcoming-title">
        📍 Live Bus Location
        {currentUser?.plan_route_name && (
          <span className="map-route-badge">{currentUser.plan_route_name}</span>
        )}
      </h3>

      {/* ← add status bar */}
      <div className="bus-status-bar">{busStatus}</div>

      {!currentUser?.plan_route_id && (
        <p className="empty-text">
          Choose a plan to see your route on the map.
        </p>
      )}
      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: "320px",
          borderRadius: "12px",
          zIndex: 1,
          marginTop: "0.75rem",
        }}
      ></div>
    </div>
  );
}

function Dashboard({
  setActive,
  announcements,
  setShowReport,
  currentUser,
  setShowScanner,
}) {
  return (
    <div className="content">
      <div className="section-label">Dashboard</div>
      {currentUser && <StudentProfile currentUser={currentUser} />}
      <ActionButtons
        setActive={setActive}
        setShowReport={setShowReport}
        setShowScanner={setShowScanner}
        currentUser={currentUser}
      />
      {currentUser && <UpcomingBus currentUser={currentUser} />}
      {currentUser && <LiveMap currentUser={currentUser} />}
      <AnnouncementList
        announcements={announcements}
        currentUser={currentUser}
      />
      {currentUser && <MyFeedbacks currentUser={currentUser} />}
      <Weather />
      <SOSButton currentUser={currentUser} />
    </div>
  );
}
