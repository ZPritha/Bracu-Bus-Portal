function App() {
  const [currentAdmin, setCurrentAdmin] = React.useState(null);
  const [active, setActive] = React.useState("Dashboard");
  const [announcements, setAnnouncements] = React.useState([]);

  React.useEffect(() => {
    fetch('http://localhost:9255/api/announcements')
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
        {active === "Reports" && <ReportAnalytics />}
        {active === "Lost & Found" && (
          <AdminLostFound currentAdmin={currentAdmin} />
        )}
      </div>
      <button className="chat-fab">💬</button>
    </div>
  );
}

const container = document.querySelector('.js-container');
ReactDOM.createRoot(container).render(<App />);