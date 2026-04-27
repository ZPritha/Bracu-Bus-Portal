function FeedbackForm({ currentUser }) {
  const [routes, setRoutes] = React.useState([]);
  const [loadingRoutes, setLoadingRoutes] = React.useState(true);
  const [routeError, setRouteError] = React.useState("");
  const [toast, setToast] = React.useState({ show: false, message: "", type: "" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const [formData, setFormData] = React.useState({
    name: currentUser ? currentUser.name : "",
    studentId: currentUser ? currentUser.studentId : "",
    busRoute: "",
    message: "",
    rating: 0,
    attachment: null
  });

  React.useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await fetch("http://localhost:9255/api/routes");
        if (!response.ok) throw new Error("Failed to fetch routes");
        const data = await response.json();
        setRoutes(data);
      } catch (error) {
        console.error("Route fetch error:", error);
        setRouteError("Could not load bus routes");
      } finally {
        setLoadingRoutes(false);
      }
    };
    fetchRoutes();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "attachment") {
      setFormData(prev => ({
        ...prev,
        attachment: files && files[0] ? files[0] : null
      }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.busRoute) {
      showToast("Please select a bus route.", "error");
      return;
    }
    if (!formData.message) {
      showToast("Please write a feedback message.", "error");
      return;
    }
    if (!formData.rating) {
      showToast("Please select a rating.", "error");
      return;
    }

    try {
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("studentId", formData.studentId);
      payload.append("busRoute", formData.busRoute);
      payload.append("message", formData.message);
      payload.append("rating", formData.rating);
      if (formData.attachment) {
        payload.append("attachment", formData.attachment);
      }

      const response = await fetch("http://localhost:9255/api/feedbacks", {
        method: "POST",
        body: payload
      });

      if (!response.ok) throw new Error("Server error: " + response.status);

      showToast("Feedback submitted successfully!", "success");

      setFormData({
        name: currentUser ? currentUser.name : "",
        studentId: currentUser ? currentUser.studentId : "",
        busRoute: "",
        message: "",
        rating: 0,
        attachment: null
      });

    } catch (error) {
      console.error("Submit error:", error);
      showToast("Failed to submit feedback. Please try again.", "error");
    }
  };

  return (
    <div style={{ paddingBottom: '100px' }}>
      <label className="field-label">
        Name
        <input
          className="text-input"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter your name"
        />
      </label>

      <label className="field-label">
        Name
        <input
          className="text-input"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter your name"
        />
      </label>

      <label className="field-label">
        Student ID
        <input
          className="text-input"
          name="studentId"
          value={formData.studentId}
          onChange={handleChange}
          placeholder="Enter your ID"
        />
      </label>

      <label className="field-label">
        Bus Route
        <select
          className="text-input"
          name="busRoute"
          value={formData.busRoute}
          onChange={handleChange}
          disabled={loadingRoutes}
        >
          <option value="">
            {loadingRoutes ? "Loading routes..." : "Select Bus Route"}
          </option>
          {routes.map(route => (
            <option key={route._id} value={route.route_name}>
              {route.route_name}
            </option>
          ))}
        </select>
      </label>

      {routeError && <p className="error-text">{routeError}</p>}

      <label className="field-label">
        Feedback Message
        <textarea
          className="text-input"
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Write your feedback..."
          rows="5"
        />
      </label>

      <label className="field-label">
        Rating
        <div className="star-container">
          {[1, 2, 3, 4, 5].map(star => (
            <span
              key={star}
              className={star <= formData.rating ? "star active" : "star"}
              onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
            >
              ★
            </span>
          ))}
        </div>
      </label>

      <label className="field-label">
        Attach File (Optional)
        <input
          className="file-input"
          type="file"
          name="attachment"
          onChange={handleChange}
          accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
        />
      </label>

      {formData.attachment && (
        <p className="file-name">Selected file: {formData.attachment.name}</p>
      )}

      <button className="submit-btn" onClick={handleSubmit}>
        Submit
      </button>

      {toast.show && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}