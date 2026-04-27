function Routes({ setActive }) {
  const [tab, setTab] = React.useState("routes");

  return (
    <div className="rm-wrapper">
      <div className="rm-tab-bar">
        <button
          className={tab === "routes" ? "tab active" : "tab"}
          onClick={() => setTab("routes")}
        >
          Manage Routes
        </button>
        <button
          className={tab === "stoppages" ? "tab active" : "tab"}
          onClick={() => setTab("stoppages")}
        >
          Manage Stoppages
        </button>
      </div>
      {tab === "routes" ? <RouteManager /> : <StoppageManager />}
    </div>
  );
}