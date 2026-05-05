/*

  function ReportModal({ onClose, currentUser, setActive }) {
  const [selectedIssue, setSelectedIssue] = React.useState('');
  const [buses, setBuses] = React.useState([]);
  const [selectedBus, setSelectedBus] = React.useState('');
  const [autoRoute, setAutoRoute] = React.useState('');
  const [autoRouteId, setAutoRouteId] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState('');

  const issues = ['Harassment', 'Safety Concern', 'Inappropriate Behaviour', 'Other'];

  React.useEffect(() => {
    fetch('https://bracu-bus-portal.onrender.com/api/buses')
      .then(r => r.json())
      .then(data => setBuses(data))
      .catch(() => setError('Could not load buses.'));
  }, []);

  const handleBusChange = (e) => {
    const busId = e.target.value;
    setSelectedBus(busId);
    const found = buses.find(b => b._id === busId);
    if (found && found.route) {
      setAutoRoute(found.route.route_name);
      setAutoRouteId(found.route._id);
    } else {
      setAutoRoute('');
      setAutoRouteId('');
    }
  };

  const handleSubmit = async () => {
    if (!selectedIssue || !selectedBus || !description) {
      setError('Please fill in all required fields.');
      return;
    }
    setSubmitted(true);
setTimeout(() => { onClose(); setActive('My Reports'); }, 1500);
    setError('');
    try {
      const res = await fetch('https://bracu-bus-portal.onrender.com/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: currentUser.studentId,  // ← auto from login
          issue_type: selectedIssue,
          bus: selectedBus,
          route: autoRouteId,
          description
        })
      });
      if (!res.ok) throw new Error('Failed');
      setSubmitted(true);
    } catch {
      setError('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="report-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        {submitted ? (
          <div className="report-success">
            <div className="success-icon">✅</div>
            <h3>Report Submitted</h3>
            <p>Your report has been received and is confidential.</p>
            <button className="btn-submit" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <h2 className="modal-title">Report an Issue</h2>

            
            <div className="form-group">
              <label>Student ID</label>
              <div className="form-input route-display">{currentUser?.studentId || 'Not found'}</div>
            </div>

            <div className="form-group">
              <label>Report Issue</label>
              <div className="issue-grid">
                {issues.map(issue => (
                  <button
                    key={issue}
                    className={`issue-btn ${selectedIssue === issue ? 'active' : ''}`}
                    onClick={() => setSelectedIssue(issue)}
                  >
                    {issue}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Bus Information</label>
              <div className="bus-info-row">
                <select className="form-select" value={selectedBus} onChange={handleBusChange}>
                  <option value="">Select Bus Number</option>
                  {buses.map(bus => (
                    <option key={bus._id} value={bus._id}>{bus.bus_number}</option>
                  ))}
                </select>
                <div className="form-input route-display">
                  {autoRoute || 'Route auto-filled'}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                className="form-textarea"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Please describe the incident in detail.."
                rows={4}
              />
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="confidential-notice">
              <span>🛡️</span>
              <strong>Your report is confidential</strong>
            </div>

            <button className="btn-submit" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </>
        )}
      </div>
    </div>
  );
} */

function ReportModal({ onClose, currentUser, setActive }) {
  const [selectedIssue, setSelectedIssue] = React.useState("");
  const [buses, setBuses] = React.useState([]);
  const [selectedBus, setSelectedBus] = React.useState("");
  const [autoRoute, setAutoRoute] = React.useState("");
  const [autoRouteId, setAutoRouteId] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [image, setImage] = React.useState(null); // ← new
  const [imagePreview, setImagePreview] = React.useState(null); // ← new
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState("");

  const issues = [
    "Harassment",
    "Safety Concern",
    "Inappropriate Behaviour",
    "Other",
  ];

  React.useEffect(() => {
    fetch("https://bracu-bus-portal.onrender.com/api/buses")
      .then((r) => r.json())
      .then((data) => setBuses(data))
      .catch(() => setError("Could not load buses."));
  }, []);

  const handleBusChange = (e) => {
    const busId = e.target.value;
    setSelectedBus(busId);
    const found = buses.find((b) => b._id === busId);
    if (found && found.route) {
      setAutoRoute(found.route.route_name);
      setAutoRouteId(found.route._id);
    } else {
      setAutoRoute("");
      setAutoRouteId("");
    }
  };

  // ← new: handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB.");
      return;
    }
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setError("");
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  // ← updated: uses FormData instead of JSON
  const handleSubmit = async () => {
    if (!selectedIssue || !selectedBus || !description) {
      setError("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("student_id", currentUser.studentId);
      formData.append("issue_type", selectedIssue);
      formData.append("bus", selectedBus);
      formData.append("route", autoRouteId);
      formData.append("description", description);
      if (image) formData.append("image", image);

      const res = await fetch(
        "https://bracu-bus-portal.onrender.com/api/reports",
        {
          method: "POST",
          body: formData, // ← no Content-Type header, browser sets it automatically
        },
      );
      if (!res.ok) throw new Error("Failed");
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setActive("My Reports");
      }, 1500);
    } catch {
      setError("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="report-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        {submitted ? (
          <div className="report-success">
            <div className="success-icon">✅</div>
            <h3>Report Submitted</h3>
            <p>Your report has been received and is confidential.</p>
            <button className="btn-submit" onClick={onClose}>
              Close
            </button>
          </div>
        ) : (
          <>
            <h2 className="modal-title">Report an Issue</h2>

            <div className="form-group">
              <label>Student ID</label>
              <div className="form-input route-display">
                {currentUser?.studentId || "Not found"}
              </div>
            </div>

            <div className="form-group">
              <label>Report Issue</label>
              <div className="issue-grid">
                {issues.map((issue) => (
                  <button
                    key={issue}
                    className={`issue-btn ${selectedIssue === issue ? "active" : ""}`}
                    onClick={() => setSelectedIssue(issue)}
                  >
                    {issue}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Bus Information</label>
              <div className="bus-info-row">
                <select
                  className="form-select"
                  value={selectedBus}
                  onChange={handleBusChange}
                >
                  <option value="">Select Bus Number</option>
                  {buses.map((bus) => (
                    <option key={bus._id} value={bus._id}>
                      {bus.bus_number}
                    </option>
                  ))}
                </select>
                <div className="form-input route-display">
                  {autoRoute || "Route auto-filled"}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                className="form-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe the incident in detail.."
                rows={4}
              />
            </div>

            {/* ← new: image upload section */}
            <div className="form-group">
              <label>
                Upload Image{" "}
                <span style={{ fontWeight: 400, color: "#999" }}>
                  (optional, max 5MB)
                </span>
              </label>
              {!imagePreview ? (
                <label className="image-upload-box">
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleImageChange}
                  />
                  <span className="upload-icon">📷</span>
                  <span className="upload-text">Click to upload image</span>
                  <span className="upload-hint">JPG, PNG, WEBP supported</span>
                </label>
              ) : (
                <div className="image-preview-wrap">
                  <img
                    src={imagePreview}
                    className="image-preview"
                    alt="preview"
                  />
                  <button className="image-remove-btn" onClick={removeImage}>
                    ✕ Remove
                  </button>
                </div>
              )}
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="confidential-notice">
              <span>🛡️</span>
              <strong>Your report is confidential</strong>
            </div>

            <button
              className="btn-submit"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
