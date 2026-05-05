function Announcement({ onClose, onSubmit, onDraftSaved, editData }) {
  const [title, setTitle] = React.useState(editData ? editData.title : "");
  const [message, setMessage] = React.useState(
    editData ? editData.message : "",
  );
  const [category, setCategory] = React.useState(
    editData ? editData.category : "",
  );
  const [selectedBus, setSelectedBus] = React.useState(
    editData ? editData.busNumber : "",
  );
  const [selectedRoute, setSelectedRoute] = React.useState(
    editData ? editData.routeName : "",
  );

  const [buses, setBuses] = React.useState([]);
  const [routes, setRoutes] = React.useState([]);

  const isEditMode = !!editData;

  const categories = [
    { value: "bus_delay", label: "🚌 Bus Delay" },
    { value: "route_change", label: "🛑 Route Change" },
    { value: "schedule_update", label: "⏰ Schedule Update" },
    { value: "maintenance", label: "🔧 Maintenance" },
    { value: "safety_notice", label: "⚠️ Safety Notice" },
    { value: "general_notice", label: "📢 General Notice" },
  ];

  React.useEffect(() => {
    fetch("https://bracu-bus-portal.onrender.com/api/buses")
      .then((res) => res.json())
      .then((data) => setBuses(data))
      .catch((err) => console.log("Failed to load buses:", err));

    fetch("https://bracu-bus-portal.onrender.com/api/routes")
      .then((res) => res.json())
      .then((data) => setRoutes(data))
      .catch((err) => console.log("Failed to load routes:", err));
  }, []);

  async function handlePublish() {
    if (!title || !message || !category) {
      alert("Please fill in title, message and category.");
      return;
    }
    try {
      let response;

      if (isEditMode) {
        // Edit existing announcement
        response = await fetch(
          `https://bracu-bus-portal.onrender.com/api/announcements/${editData._id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title,
              message,
              category,
              busNumber: selectedBus,
              routeName: selectedRoute,
            }),
          },
        );
      } else {
        // Create new announcement
        response = await fetch(
          "https://bracu-bus-portal.onrender.com/api/announcements",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title,
              message,
              category,
              busNumber: selectedBus,
              routeName: selectedRoute,
              status: "published",
            }),
          },
        );
      }

      const data = await response.json();
      onSubmit(data);
    } catch (err) {
      alert("Failed to publish. Is the server running?");
    }
  }

  async function handleDraft() {
    if (!title || !message || !category) {
      alert("Please fill in title, message and category.");
      return;https://bracu-bus-portal.onrender.com
    }
    try {
      await fetch("https://bracu-bus-portal.onrender.com/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          message,
          category,
          busNumber: selectedBus,
          routeName: selectedRoute,
          status: "draft",
        }),
      });
      alert("Saved as draft!");
      onDraftSaved();
    } catch (err) {
      alert("Failed to save draft. Is the server running?");
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <span className="modal-bell">🔔</span>
            <span>
              {isEditMode ? "Edit Announcement" : "Create Announcement"}
            </span>
          </div>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <input
          className="modal-input"
          placeholder="Announcement title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <select
          className="modal-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Select Category</option>
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        <select
          className="modal-select"
          value={selectedBus}
          onChange={(e) => setSelectedBus(e.target.value)}
        >
          <option value="">Select Bus (optional)</option>
          {buses.length === 0 ? (
            <option disabled>Loading buses...</option>
          ) : (
            buses.map((b) => (
              <option key={b._id} value={b.bus_number}>
                {b.bus_number}
              </option>
            ))
          )}
        </select>

        <select
          className="modal-select"
          value={selectedRoute}
          onChange={(e) => setSelectedRoute(e.target.value)}
        >
          <option value="">Select Route (optional)</option>
          {routes.length === 0 ? (
            <option disabled>Loading routes...</option>
          ) : (
            routes.map((r) => (
              <option key={r._id} value={r.route_name}>
                {r.route_name}
              </option>
            ))
          )}
        </select>

        <textarea
          className="modal-textarea"
          placeholder="Announcement message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <div className="modal-actions">
          <button className="btn-public" onClick={handlePublish}>
            {isEditMode ? "Save Changes" : "Public Announcement"}
          </button>
          {!isEditMode && (
            <button className="btn-draft" onClick={handleDraft}>
              Save Draft
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
