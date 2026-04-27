function StoppageManager() {
  const [routes, setRoutes] = React.useState([]);
  const [stoppages, setStoppages] = React.useState([]);
  const [selectedRoute, setSelectedRoute] = React.useState("");
  const [editingStoppage, setEditingStoppage] = React.useState(null);
  const [toast, setToast] = React.useState({ show: false, message: "", type: "" });

  const [formData, setFormData] = React.useState({
    stoppage_name: "",
    stoppage_order: ""
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  React.useEffect(() => {
    fetch("http://localhost:9255/api/routes")
      .then(res => res.json())
      .then(data => setRoutes(data))
      .catch(() => showToast("Failed to load routes", "error"));
  }, []);

  const fetchStoppages = () => {
    if (!selectedRoute) return;
    fetch("http://localhost:9255/api/stoppages")
      .then(res => res.json())
      .then(data => {
        // compare as string since ObjectId.toString() === _id string
        const filtered = data.filter(s =>
          s.route_id && s.route_id.toString() === selectedRoute
        );
        setStoppages(filtered);
      })
      .catch(() => showToast("Failed to load stoppages", "error"));
  };

  React.useEffect(() => {
    fetchStoppages();
  }, [selectedRoute]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!selectedRoute) return showToast("Select a route first", "error");
    if (!formData.stoppage_name.trim()) return showToast("Stoppage name is required", "error");
    if (!formData.stoppage_order) return showToast("Stoppage order is required", "error");

    try {
      const method = editingStoppage ? "PUT" : "POST";
      const url = editingStoppage
        ? `http://localhost:9255/api/stoppages/${editingStoppage._id}`
        : "http://localhost:9255/api/stoppages";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stoppage_name: formData.stoppage_name,
          stoppage_order: Number(formData.stoppage_order),
          distance_km: 0,       // ← send 0 since backend requires it
          route_id: selectedRoute
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed");
      }

      showToast(editingStoppage ? "Stoppage updated!" : "Stoppage added!");
      setFormData({ stoppage_name: "", stoppage_order: "" });
      setEditingStoppage(null);
      fetchStoppages();

    } catch (err) {
      console.error(err);
      showToast("Operation failed: " + err.message, "error");
    }
  };

  const handleEdit = (stoppage) => {
    setEditingStoppage(stoppage);
    setFormData({
      stoppage_name: stoppage.stoppage_name,
      stoppage_order: stoppage.stoppage_order
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this stoppage?")) return;
    try {
      const res = await fetch(`http://localhost:9255/api/stoppages/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      showToast("Stoppage deleted!");
      setStoppages(prev => prev.filter(s => s._id !== id));
    } catch (err) {
      showToast("Delete failed", "error");
    }
  };

  const handleCancel = () => {
    setEditingStoppage(null);
    setFormData({ stoppage_name: "", stoppage_order: "" });
  };

  return (
    <div className="rm-section">

      <select
        className="rm-input"
        value={selectedRoute}
        onChange={e => setSelectedRoute(e.target.value)}
        style={{ marginBottom: "1.25rem" }}
      >
        <option value="">Select a Route</option>
        {routes.map(r => (
          <option key={r._id} value={r._id}>{r.route_name}</option>
        ))}
      </select>

      {selectedRoute && (
        <div className="rm-form" style={{ marginBottom: "1.5rem" }}>
          <input
            className="rm-input"
            name="stoppage_name"
            placeholder="Stoppage name"
            value={formData.stoppage_name}
            onChange={handleChange}
          />
          <input
            className="rm-input"
            name="stoppage_order"
            type="number"
            placeholder="Order (e.g. 1, 2, 3)"
            value={formData.stoppage_order}
            onChange={handleChange}
          />
          <div className="rm-form-btns">
            <button className="rm-btn rm-btn-primary" onClick={handleSubmit}>
              {editingStoppage ? "Update" : "Add Stoppage"}
            </button>
            {editingStoppage && (
              <button className="rm-btn rm-btn-cancel" onClick={handleCancel}>Cancel</button>
            )}
          </div>

        </div>  
      )}

      <h2 className="rm-title">Stoppages</h2>

      {selectedRoute && (
        <div className="rm-list">
          {stoppages.length === 0 && <p className="rm-empty">No stoppages for this route.</p>}
          {stoppages
            .sort((a, b) => a.stoppage_order - b.stoppage_order)
            .map(s => (
              <div key={s._id} className="rm-card">
                <div className="rm-card-info">
                  <span className="rm-order-badge">#{s.stoppage_order}</span>
                  <span className="rm-card-name">{s.stoppage_name}</span>
                </div>
                <div className="rm-card-actions">
                  <button className="rm-btn rm-btn-edit" onClick={() => handleEdit(s)}>Edit</button>
                  <button className="rm-btn rm-btn-delete" onClick={() => handleDelete(s._id)}>Delete</button>
                </div>
              </div>
            ))}
        </div>
      )}

      {toast.show && <div className={`toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
}