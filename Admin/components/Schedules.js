function Schedules() {
  const [schedules, setSchedules] = React.useState([]);
  const [routes, setRoutes] = React.useState([]);
  const [stoppages, setStoppages] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [showModal, setShowModal] = React.useState(false);
  const [editingId, setEditingId] = React.useState(null);

  const [formData, setFormData] = React.useState({
    route_id: "",
    stoppage_id: "",
    first_pickup_time: "",
    second_pickup_time: "",
    first_departure_time: "",
    second_departure_time: "",
  });

  React.useEffect(() => {
    fetchSchedules();
    fetchRoutes();
  }, []);

  const fetchSchedules = () => {
    setLoading(true);
    fetch("https://bracu-bus-portal.onrender.com/api/schedules/all")
      .then((res) => res.json())
      .then((data) => {
        setSchedules(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const fetchRoutes = () => {
    fetch("https://bracu-bus-portal.onrender.com/api/routes")
      .then((res) => res.json())
      .then((data) => setRoutes(data))
      .catch((err) => console.error(err));
  };

  const fetchStoppages = (routeId) => {
    if (!routeId) {
      setStoppages([]);
      return;
    }
    fetch(
      `https://bracu-bus-portal.onrender.com/api/stoppages/route/${routeId}`,
    )
      .then((res) => res.json())
      .then((data) => setStoppages(data))
      .catch((err) => console.error(err));
  };

  const handleRouteChange = (e) => {
    const routeId = e.target.value;
    setFormData({ ...formData, route_id: routeId, stoppage_id: "" });
    fetchStoppages(routeId);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      route_id: "",
      stoppage_id: "",
      first_pickup_time: "",
      second_pickup_time: "",
      first_departure_time: "",
      second_departure_time: "",
    });
    setStoppages([]);
    setShowModal(true);
  };

  const openEditModal = (s) => {
    setEditingId(s._id);
    setFormData({
      route_id: s.route_id._id,
      stoppage_id: s.stoppage_id._id,
      first_pickup_time: s.first_pickup_time,
      second_pickup_time: s.second_pickup_time,
      first_departure_time: s.first_departure_time,
      second_departure_time: s.second_departure_time,
    });
    fetchStoppages(s.route_id._id);
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = editingId
      ? `https://bracu-bus-portal.onrender.com/api/schedules/${editingId}`
      : "https://bracu-bus-portal.onrender.com/api/schedules";
    const method = editingId ? "PUT" : "POST";

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then(() => {
        fetchSchedules();
        setShowModal(false);
      })
      .catch((err) => console.error(err));
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this schedule?"))
      return;
    fetch(`https://bracu-bus-portal.onrender.com/api/schedules/${id}`, {
      method: "DELETE",
    })
      .then(() => fetchSchedules())
      .catch((err) => console.error(err));
  };

  return (
    <div className="content">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <div className="section-label">Manage Schedules</div>
        <button
          className="action-btn btn-book"
          style={{ width: "auto", padding: "10px 20px" }}
          onClick={openAddModal}
        >
          + Add Schedule
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Loading schedules...</div>
      ) : (
        <div className="table-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Route</th>
                <th>Stoppage</th>
                <th>Pick-up 1</th>
                <th>Pick-up 2</th>
                <th>Departure 1</th>
                <th>Departure 2</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((s) => (
                <tr key={s._id}>
                  <td style={{ fontWeight: 800 }}>
                    {s.route_id?.route_number} - {s.route_id?.route_name}
                  </td>
                  <td>{s.stoppage_id?.stoppage_name}</td>
                  <td>{s.first_pickup_time}</td>
                  <td>{s.second_pickup_time}</td>
                  <td>{s.first_departure_time}</td>
                  <td>{s.second_departure_time}</td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        className="edit-btn"
                        onClick={() => openEditModal(s)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(s._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {schedules.length === 0 && (
            <div className="empty-state">
              No schedules found. Click "Add Schedule" to create one.
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingId ? "Edit Schedule" : "Add New Schedule"}
              </h2>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Select Route</label>
                <select
                  className="form-select"
                  name="route_id"
                  value={formData.route_id}
                  onChange={handleRouteChange}
                  required
                >
                  <option value="">-- Choose Route --</option>
                  {routes.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.route_number} - {r.route_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Select Stoppage</label>
                <select
                  className="form-select"
                  name="stoppage_id"
                  value={formData.stoppage_id}
                  onChange={handleInputChange}
                  required
                  disabled={!formData.route_id}
                >
                  <option value="">-- Choose Stoppage --</option>
                  {stoppages.map((st) => (
                    <option key={st._id} value={st._id}>
                      {st.stoppage_name}
                    </option>
                  ))}
                </select>
              </div>

              <div
                className="form-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "15px",
                }}
              >
                <div className="form-group">
                  <label>1st Pick-up Time</label>
                  <input
                    type="text"
                    className="form-input"
                    name="first_pickup_time"
                    placeholder="e.g. 7:00 AM"
                    value={formData.first_pickup_time}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>2nd Pick-up Time</label>
                  <input
                    type="text"
                    className="form-input"
                    name="second_pickup_time"
                    placeholder="e.g. 8:30 AM"
                    value={formData.second_pickup_time}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div
                className="form-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "15px",
                }}
              >
                <div className="form-group">
                  <label>1st Departure Time</label>
                  <input
                    type="text"
                    className="form-input"
                    name="first_departure_time"
                    placeholder="e.g. 2:00 PM"
                    value={formData.first_departure_time}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>2nd Departure Time</label>
                  <input
                    type="text"
                    className="form-input"
                    name="second_departure_time"
                    placeholder="e.g. 4:30 PM"
                    value={formData.second_departure_time}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
                <button
                  type="submit"
                  className="btn-submit"
                  style={{ flex: 2 }}
                >
                  {editingId ? "Update Schedule" : "Save Schedule"}
                </button>
                <button
                  type="button"
                  className="btn-draft"
                  style={{ flex: 1 }}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
