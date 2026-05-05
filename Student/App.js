// ── Hash routing maps ──────────────────────────────────────────────────────
const STUDENT_HASH_TO_ACTIVE = {
  "/dashboard": "Dashboard",
  "/schedules": "Schedules",
  "/lost-found": "Lost & Found",
  "/my-bookings": "payment",
  "/info": "Info & Rules",
  "/feedback": "Feedback",
  "/my-reports": "My Reports",
  "/book-seat": "Book Seat",
  "/choose-plan": "Choose Plan",
  "/booking": "Booking",
  "/my-waitlist": "My Waitlist",
};
const STUDENT_ACTIVE_TO_HASH = Object.fromEntries(
  Object.entries(STUDENT_HASH_TO_ACTIVE).map(([h, a]) => [a, h]),
);

function getInitialActive() {
  const hash = window.location.hash.replace("#", "");
  return STUDENT_HASH_TO_ACTIVE[hash] || "Dashboard";
}

function App() {
  const [currentUser, setCurrentUser] = React.useState(null);
  const [active, setActive] = React.useState(getInitialActive);
  const [fare, setFare] = React.useState(0);
  const [plan, setPlan] = React.useState("No Plan");
  const [announcements, setAnnouncements] = React.useState([]);
  const [notifications, setNotifications] = React.useState([]);
  const [bookingInfo, setBookingInfo] = React.useState({});
  const [showReport, setShowReport] = React.useState(false);
  const [showScanner, setShowScanner] = React.useState(false);

  // Navigate: update state + URL hash together
  function navigate(page) {
    const hash = STUDENT_ACTIVE_TO_HASH[page] || "/dashboard";
    window.history.pushState({ page }, "", "#" + hash);
    setActive(page);
  }

  // Sync active when user presses browser Back / Forward
  React.useEffect(() => {
    function onHashChange() {
      const hash = window.location.hash.replace("#", "");
      const page = STUDENT_HASH_TO_ACTIVE[hash] || "Dashboard";
      setActive(page);
    }
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  function handleScanSuccess(scannedValue) {
    // scannedValue is expected to be something like "Route 1"
    fetch(
      `https://bracu-bus-portal.onrender.com/api/bookings/update-status-by-route`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: currentUser.studentId,
          routeName: scannedValue,
          arrival_status: "arrived",
        }),
      },
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.modifiedCount > 0) {
          alert(
            `✅ Welcome aboard! ${data.modifiedCount} booking(s) for ${scannedValue} updated to Arrived.`,
          );
        } else if (data.matchedCount > 0) {
          alert(`ℹ️ You are already marked as Arrived for ${scannedValue}.`);
        } else {
          alert(`❌ No active bookings found for ${scannedValue}.`);
        }
      })
      .catch((err) => {
        console.error(err);
        alert("❌ Failed to update arrival status.");
      });
  }

  React.useEffect(() => {
    fetch("https://bracu-bus-portal.onrender.com/api/announcements")
      .then((res) => res.json())
      .then((data) => setAnnouncements(data))
      .catch((err) => console.log(err));
  }, []);

  // Set hash to #/dashboard when user logs in for the first time
  React.useEffect(() => {
    if (!currentUser) return;
    if (!window.location.hash) {
      window.history.replaceState({}, "", "#/dashboard");
    }
  }, [currentUser]);

  React.useEffect(() => {
    if (!currentUser) return;
    function fetchNotifications() {
      fetch(`https://bracu-bus-portal.onrender.com/api/notifications/${currentUser.studentId}`)
        .then((res) => res.json())
        .then((data) => setNotifications(data))
        .catch((err) => console.log(err));
    }
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [currentUser]);

  React.useEffect(() => {
    if (!currentUser) return;
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    if (!payment) return;

    const tran_id = params.get("tran_id") || sessionStorage.getItem("tran_id");
    const studentId =
      params.get("studentId") ||
      sessionStorage.getItem("studentId") ||
      currentUser.studentId;
    const fallbackPlan = sessionStorage.getItem("plan_name");

    const clearPaymentSession = () => {
      sessionStorage.removeItem("tran_id");
      sessionStorage.removeItem("studentId");
      sessionStorage.removeItem("plan_name");
      sessionStorage.removeItem("plan_fare");
      sessionStorage.removeItem("route_id");
      sessionStorage.removeItem("route_name");
      sessionStorage.removeItem("stoppage_id");
      sessionStorage.removeItem("stoppage_name");
    };

    const handleFailure = () => {
      if (payment === "cancel") {
        alert("Payment cancelled.");
      } else {
        alert("❌ Payment failed. Please try again.");
      }
      clearPaymentSession();
      window.history.replaceState({}, "", window.location.pathname);
    };

    if (!tran_id || !studentId) {
      if (payment === "success") {
        alert(
          "Payment return received, but transaction info is missing. Please check My Bookings.",
        );
      } else {
        handleFailure();
      }
      return;
    }

    fetch(
      `https://bracu-bus-portal.onrender.com/api/payment/verify/${encodeURIComponent(tran_id)}?studentId=${encodeURIComponent(studentId)}`,
    )
      .then((res) => res.json())
      .then((result) => {
        if (result?.success && result?.booking) {
          const paidPlan =
            result.booking.plan_name || fallbackPlan || "No Plan";
          setPlan(paidPlan);
          clearPaymentSession();
          window.history.replaceState({}, "", window.location.pathname);
          alert(`✅ Payment successful! ${paidPlan} plan activated.`);
          navigate("payment");
          return;
        }

        if (payment === "success") {
          alert(
            "Payment callback received but booking is not confirmed yet. Please refresh My Bookings in a few seconds.",
          );
          window.history.replaceState({}, "", window.location.pathname);
          return;
        }

        handleFailure();
      })
      .catch((err) => {
        console.log("Payment verify error:", err);
        if (payment === "success") {
          alert(
            "Could not verify payment right now. Please check My Bookings shortly.",
          );
          window.history.replaceState({}, "", window.location.pathname);
          return;
        }
        handleFailure();
      });
  }, [currentUser]);

  function handleMarkAllRead() {
    if (!currentUser) return;
    fetch(
      `https://bracu-bus-portal.onrender.com/api/notifications/${currentUser.studentId}/read-all`,
      { method: "PATCH" },
    )
      .then(() =>
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true }))),
      )
      .catch((err) => console.log(err));
  }

  function handleLogout() {
    setCurrentUser(null);
    setActive("Dashboard");
    setNotifications([]);
    window.history.replaceState({}, "", "#/dashboard");
  }

  if (!currentUser) {
    return <Login onLogin={setCurrentUser} />;
  }

  return (
    <div className="app">
      <Sidebar active={active} setActive={navigate} />
      <div className="main">
        <Topbar
          user={currentUser}
          onLogout={handleLogout}
          notifications={notifications}
          onMarkAllRead={handleMarkAllRead}
          setActive={navigate}
        />
        {active === "Dashboard" && (
          <Dashboard
            setActive={navigate}
            announcements={announcements}
            currentUser={currentUser}
            setShowReport={setShowReport}
            setShowScanner={setShowScanner}
          />
        )}
        {active === "Schedules" && <StudentSchedules />}
        {active === "Lost & Found" && (
          <LostFound currentUser={currentUser} setActive={navigate} />
        )}
        {active === "Book Seat" && (
          <BookSeat
            setActive={navigate}
            setFare={setFare}
            setBookingInfo={setBookingInfo}
          />
        )}
        {active === "Choose Plan" && (
          <ChoosePlan
            setActive={navigate}
            fare={fare}
            setPlan={setPlan}
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            bookingInfo={bookingInfo}
          />
        )}
        {active === "Booking" && (
          <Booking
            setActive={navigate}
            fare={fare}
            plan={plan}
            currentUser={currentUser}
          />
        )}

        {active === "payment" && (
          <MyBookings currentUser={currentUser} setActive={navigate} />
        )}

        {active === "Feedback" && (
          <Feedback setActive={navigate} currentUser={currentUser} />
        )}
        {active === "My Reports" && (
          <MyReports currentUser={currentUser} setActive={navigate} />
        )}
        {active === "My Waitlist" && (
          <MyWaitlist currentUser={currentUser} setActive={navigate} />
        )}
        {active === "Info & Rules" && <InfoRules />}

        {showReport && (
          <ReportModal
            onClose={() => setShowReport(false)}
            currentUser={currentUser}
            setActive={navigate}
          />
        )}

        {showScanner && (
          <QRScanner
            onScanSuccess={handleScanSuccess}
            onClose={() => setShowScanner(false)}
          />
        )}
      </div>
      <button className="chat-fab">💬</button>
    </div>
  );
}

const container = document.querySelector(".js-container");
ReactDOM.createRoot(container).render(<App />);
