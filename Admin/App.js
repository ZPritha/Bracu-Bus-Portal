/*function App() {
  const [currentAdmin, setCurrentAdmin] = React.useState(null);
  const [active, setActive] = React.useState("Dashboard");
  const [announcements, setAnnouncements] = React.useState([]);

  React.useEffect(() => {
    fetch('https://bracu-bus-portal.onrender.com/api/announcements')
      .then(res => res.json())
      .then(data => setAnnouncements(data))
      .catch(err => console.log(err));
  }, []);

  function addAnnouncement(title, message, id) {
    setAnnouncements(prev => [{ title, message, _id: id }, ...prev]);
  }

  function handleLogout() {
    setCurrentAdmin(null);
    setActive("Dashboard");
  }

  if (!currentAdmin) {
    return <AdminLogin onLogin={setCurrentAdmin} />;
  }

  return (
    <div className="app">
      <Sidebar active={active} setActive={setActive} />
      <div className="main">
        <Topbar admin={currentAdmin} onLogout={handleLogout} />
        {active === "Dashboard" && (
          <Dashboard
            setActive={setActive}
            announcements={announcements}
            addAnnouncement={addAnnouncement}
            setAnnouncements={setAnnouncements}
          />
        )}
        {active === "Routes" && <Routes setActive={setActive} />}
        {active === "Feedback" && <Feedback setActive={setActive} />}
        {active === "Bookings" && <AdminBookings />}
        {active === "Schedules" && <ScheduleManager />}
        {active === "Reports" && <ReportAnalytics />}
        {active === "Reports" && <AdminReports />}
        {active === "Lost & Found" && (
          <AdminLostFound currentAdmin={currentAdmin} />
        )}
      </div>
      <button className="chat-fab">💬</button>
    </div>
  );
}

const container = document.querySelector('.js-container');
ReactDOM.createRoot(container).render(<App />);*/

// ── Hash routing maps ──────────────────────────────────────────────────────
const ADMIN_HASH_TO_ACTIVE = {
  "/dashboard": "Dashboard",
  "/routes": "Routes",
  "/schedules": "Schedules",
  "/bookings": "Bookings",
  "/reports": "Reports",
  "/lost-found": "Lost & Found",
  "/feedback": "Feedback",
};
const ADMIN_ACTIVE_TO_HASH = Object.fromEntries(
  Object.entries(ADMIN_HASH_TO_ACTIVE).map(([h, a]) => [a, h]),
);

function getAdminInitialActive() {
  const hash = window.location.hash.replace("#", "");
  return ADMIN_HASH_TO_ACTIVE[hash] || "Dashboard";
}

function App() {
  const [currentAdmin, setCurrentAdmin] = React.useState(null);
  const [active, setActive] = React.useState(getAdminInitialActive);
  const [announcements, setAnnouncements] = React.useState([]);

  // Navigate: update state + URL hash together
  function navigate(page) {
    const hash = ADMIN_ACTIVE_TO_HASH[page] || "/dashboard";
    window.history.pushState({ page }, "", "#" + hash);
    setActive(page);
  }

  // Sync active when user presses browser Back / Forward
  React.useEffect(() => {
    function onHashChange() {
      const hash = window.location.hash.replace("#", "");
      const page = ADMIN_HASH_TO_ACTIVE[hash] || "Dashboard";
      setActive(page);
    }
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  React.useEffect(() => {
    fetch("https://bracu-bus-portal.onrender.com/api/announcements")
      .then((res) => res.json())
      .then((data) => setAnnouncements(data))
      .catch((err) => console.log(err));
  }, []);

  // Set hash on login
  React.useEffect(() => {
    if (!currentAdmin) return;
    if (!window.location.hash) {
      window.history.replaceState({}, "", "#/dashboard");
    }
  }, [currentAdmin]);

  function addAnnouncement(title, message, id) {
    setAnnouncements((prev) => [{ title, message, _id: id }, ...prev]);
  }

  function handleLogout() {
    setCurrentAdmin(null);
    setActive("Dashboard");
    window.history.replaceState({}, "", "#/dashboard");
  }

  if (!currentAdmin) {
    return <AdminLogin onLogin={setCurrentAdmin} />;
  }

  return (
    <div className="app">
      <Sidebar active={active} setActive={navigate} />
      <div className="main">
        <Topbar admin={currentAdmin} onLogout={handleLogout} />
        {active === "Dashboard" && (
          <Dashboard
            setActive={navigate}
            announcements={announcements}
            addAnnouncement={addAnnouncement}
            setAnnouncements={setAnnouncements}
          />
        )}
        {active === "Routes" && <Routes setActive={navigate} />}
        {active === "Feedback" && <Feedback setActive={navigate} />}
        {active === "Bookings" && <AdminBookings />}
        {active === "Schedules" && <ScheduleManager />}
        {active === "Reports" && <ReportsPage />}
        {active === "Lost & Found" && (
          <AdminLostFound currentAdmin={currentAdmin} />
        )}
      </div>
      <button className="chat-fab">💬</button>
    </div>
  );
}

const container = document.querySelector(".js-container");
ReactDOM.createRoot(container).render(<App />);
