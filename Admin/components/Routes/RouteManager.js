function RouteManager() {
  const [routes, setRoutes] = React.useState([]);
  const [routeName, setRouteName] = React.useState("");
  const [editingRoute, setEditingRoute] = React.useState(null);
  const [toast, setToast] = React.useState({
    show: false,
    message: "",
    type: "",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const fetchRoutes = async () => {
    try {
      const res = await fetch(
        "https://bracu-bus-portal.onrender.com/api/routes",
      );
      const data = await res.json();
      setRoutes(data);
    } catch (err) {
      showToast("Failed to load routes", "error");
    }
  };

  React.useEffect(() => {
    fetchRoutes();
  }, []);

  const handleSubmit = async () => {
    if (!routeName.trim()) return showToast("Route name is required", "error");

    try {
      const method = editingRoute ? "PUT" : "POST";
      const url = editingRoute
        ? `https://bracu-bus-portal.onrender.com/api/routes/${editingRoute._id}`
        : "https://bracu-bus-portal.onrender.com/api/routes";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ route_name: routeName }),
      });

      if (!res.ok) throw new Error("Failed");
      showToast(editingRoute ? "Route updated!" : "Route added!");
      setRouteName("");
      setEditingRoute(null);
      fetchRoutes();
    } catch (err) {
      showToast("Operation failed", "error");
    }
  };

  const handleEdit = (route) => {
    setEditingRoute(route);
    setRouteName(route.route_name);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this route?")) return;
    try {
      const res = await fetch(
        `https://bracu-bus-portal.onrender.com/api/routes/${id}`,
        {
          method: "DELETE",
        },
      );
      if (!res.ok) throw new Error("Failed");
      showToast("Route deleted!");
      fetchRoutes();
    } catch (err) {
      showToast("Delete failed", "error");
    }
  };

  const handleCancel = () => {
    setEditingRoute(null);
    setRouteName("");
  };

  return (
    <div className="rm-section">
      <h2 className="rm-title">Routes</h2>

      {/* Form */}
      <div className="rm-form">
        <input
          className="rm-input"
          placeholder="Enter route name"
          value={routeName}
          onChange={(e) => setRouteName(e.target.value)}
        />
        <button className="rm-btn rm-btn-primary" onClick={handleSubmit}>
          {editingRoute ? "Update" : "Add Route"}
        </button>
        {editingRoute && (
          <button className="rm-btn rm-btn-cancel" onClick={handleCancel}>
            Cancel
          </button>
        )}
      </div>

      {/* List */}
      <div className="rm-list">
        {routes.length === 0 && <p className="rm-empty">No routes found.</p>}
        {routes.map((route) => (
          <div key={route._id} className="rm-card">
            <span className="rm-card-name">{route.route_name}</span>
            <div className="rm-card-actions">
              <button
                className="rm-btn rm-btn-edit"
                onClick={() => handleEdit(route)}
              >
                Edit
              </button>
              <button
                className="rm-btn rm-btn-delete"
                onClick={() => handleDelete(route._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {toast.show && (
        <div className={`toast ${toast.type}`}>{toast.message}</div>
      )}
    </div>
  );
}
