function MyReports({ currentUser, setActive }) {
  const [reports, setReports] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    fetch(
      `https://bracu-bus-portal.onrender.com/api/reports/student/${currentUser.studentId}`,
    )
      .then((r) => r.json())
      .then((data) => {
        setReports(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load reports.");
        setLoading(false);
      });
  }, []);

  const statusColor = (status) => {
    if (status === "resolved") return "#22c55e";
    if (status === "reviewed") return "#f59e0b";
    return "#6c63ff";
  };

  return (
    <div className="content">
      <div className="section-label">My Reports</div>

      {loading && (
        <p style={{ color: "#888", marginTop: "20px" }}>Loading reports...</p>
      )}
      {error && <p style={{ color: "red", marginTop: "20px" }}>{error}</p>}

      {!loading && reports.length === 0 && (
        <div className="no-reports">
          <div style={{ fontSize: "48px" }}>📋</div>
          <p>You haven't submitted any reports yet.</p>
          <button
            className="btn-submit"
            style={{ width: "auto", padding: "10px 24px" }}
            onClick={() => setActive("Dashboard")}
          >
            Go Back
          </button>
        </div>
      )}

      {!loading && reports.length > 0 && (
        <div className="reports-table-wrap">
          <table className="reports-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Issue Type</th>
                <th>Bus</th>
                <th>Route</th>
                <th>Description</th>
                <th>Status</th>
                <th>Image</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r, i) => (
                <tr key={r._id}>
                  <td>{i + 1}</td>
                  <td>
                    <span className="issue-tag">{r.issue_type}</span>
                  </td>
                  <td>{r.bus?.bus_number || "-"}</td>
                  <td>{r.route?.route_name || "-"}</td>
                  <td className="desc-cell">{r.description}</td>
                  <td>
                    {" "}
                    {/* ← add this block */}
                    {r.image_url ? (
                      <a
                        href={`https://bracu-bus-portal.onrender.com${r.image_url}`}
                        target="_blank"
                      >
                        <img
                          src={`https://bracu-bus-portal.onrender.com${r.image_url}`}
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                            borderRadius: "8px",
                          }}
                          alt="evidence"
                        />
                      </a>
                    ) : (
                      <span style={{ color: "#ccc" }}>—</span>
                    )}
                  </td>
                  <td>
                    <span
                      className="status-badge"
                      style={{ background: statusColor(r.status) }}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
