function ReportAnalytics() {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [updatingId, setUpdatingId] = React.useState("");
  const [view, setView] = React.useState("reports"); // 'reports' | 'charts'

  function loadAnalytics() {
    setLoading(true);
    fetch(
      "https://bracu-bus-portal.onrender.com/api/reports/analytics/credibility",
    )
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`API ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then((d) => {
        setData(d);
        setError("");
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setError(err.message || "Failed to load report analytics.");
        setLoading(false);
      });
  }

  React.useEffect(() => {
    loadAnalytics();
  }, []);

  async function updateReportStatus(reportId, status) {
    try {
      //bracu-bus-portal.onrender.com
      https: setUpdatingId(reportId);
      const res = await fetch(
        `https://bracu-bus-portal.onrender.com/api/reports/${reportId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        },
      );

      if (!res.ok) {
        throw new Error(`Update failed (${res.status})`);
      }

      loadAnalytics();
    } catch (err) {
      alert(err.message || "Could not update report status.");
    } finally {
      setUpdatingId("");
    }
  }

  function getCredibilityColor(pct) {
    if (pct >= 70) return "#f87171"; // soft red
    if (pct >= 40) return "#fbbf24"; // soft amber
    return "#6ee7b7"; // soft green
  }

  function getCredibilityLabel(pct) {
    if (pct >= 70) return "🔴 High Risk";
    if (pct >= 40) return "🟡 Medium Risk";
    return "🟢 Low Risk";
  }

  function getCredibilityIcon(pct) {
    return pct >= 70 ? "⚠️" : "ℹ️";
  }

  if (loading)
    return (
      <div style={{ padding: "20px", color: "#888" }}>Loading analytics...</div>
    );

  if (error) {
    return (
      <div className="content">
        <div className="section-label">Report Analytics</div>
        <div
          style={{
            marginTop: "16px",
            background: "#fff0f0",
            color: "#b42318",
            border: "1px solid #fda29b",
            borderRadius: "12px",
            padding: "14px 16px",
            fontSize: "13px",
          }}
        >
          Could not load analytics: {error}.<br />
          Please restart backend server and confirm route{" "}
          <strong>/api/reports/analytics/credibility</strong> exists.
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="content">
        <div className="section-label">Report Analytics</div>
        <div style={{ marginTop: "16px", color: "#888" }}>
          No analytics data available.
        </div>
      </div>
    );
  }

  const busEntries = Object.entries(data.busStats || {});
  const busChartData = busEntries.map(([bus, stats]) => ({
    bus,
    credibility: Number(stats.avgCredibility) || 0,
    reports: Number(stats.reports) || 0,
  }));

  const chartWidth = 820;
  const chartHeight = 300;
  const margin = { top: 20, right: 20, bottom: 60, left: 45 };
  const plotWidth = chartWidth - margin.left - margin.right;
  const plotHeight = chartHeight - margin.top - margin.bottom;
  const chartTickValues = [0, 20, 40, 60, 80, 100];
  const barGap = 18;
  const barWidth =
    busChartData.length > 0
      ? Math.max(
          24,
          Math.min(
            90,
            (plotWidth - (busChartData.length - 1) * barGap) /
              busChartData.length,
          ),
        )
      : 40;

  return (
    <div className="content">
      <div className="section-label">Report Analytics</div>

      {/* Tab buttons */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button
          onClick={() => setView("reports")}
          style={{
            padding: "8px 20px",
            borderRadius: "20px",
            border: "none",
            background: view === "reports" ? "#2e86de" : "#e8f0fe",
            color: view === "reports" ? "#fff" : "#333",
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "Nunito, sans-serif",
          }}
        >
          📋 Reports & Credibility
        </button>
        <button
          onClick={() => setView("charts")}
          style={{
            padding: "8px 20px",
            borderRadius: "20px",
            border: "none",
            background: view === "charts" ? "#2e86de" : "#e8f0fe",
            color: view === "charts" ? "#fff" : "#333",
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "Nunito, sans-serif",
          }}
        >
          📊 Charts
        </button>
      </div>

      {view === "reports" && (
        <div>
          {/* Summary cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: "16px",
                padding: "20px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                textAlign: "center",
              }}
            >
              <div
                style={{ fontSize: "32px", fontWeight: 800, color: "#2e86de" }}
              >
                {data.totalReports}
              </div>
              <div
                style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}
              >
                Total Reports
              </div>
            </div>
            <div
              style={{
                background: "#fff",
                borderRadius: "16px",
                padding: "20px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                textAlign: "center",
              }}
            >
              <div
                style={{ fontSize: "32px", fontWeight: 800, color: "#f59e0b" }}
              >
                {data.statusSummary.pending}
              </div>
              <div
                style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}
              >
                Pending
              </div>
            </div>
            <div
              style={{
                background: "#fff",
                borderRadius: "16px",
                padding: "20px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                textAlign: "center",
              }}
            >
              <div
                style={{ fontSize: "32px", fontWeight: 800, color: "#22c55e" }}
              >
                {data.statusSummary.resolved}
              </div>
              <div
                style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}
              >
                Resolved
              </div>
            </div>
          </div>

          {/* Reports list with credibility */}
          {data.reports.length === 0 && (
            <div
              style={{ textAlign: "center", color: "#aaa", padding: "40px" }}
            >
              No reports yet.
            </div>
          )}
          {data.reports.map((r, i) => (
            <div
              key={r._id}
              style={{
                background: "#fff",
                borderRadius: "16px",
                padding: "20px",
                marginBottom: "16px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                borderLeft: `4px solid ${getCredibilityColor(r.credibility)}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "12px",
                }}
              >
                <div>
                  <span
                    style={{
                      background: "#ede9fe",
                      color: "#6c63ff",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: 700,
                    }}
                  >
                    {r.issue_type}
                  </span>
                  <span
                    style={{
                      marginLeft: "8px",
                      fontSize: "12px",
                      color: "#888",
                    }}
                  >
                    {r.bus_number} • {r.route_name}
                  </span>
                </div>
                <span
                  style={{
                    background:
                      r.status === "resolved"
                        ? "#e8fff0"
                        : r.status === "reviewed"
                          ? "#fff8e8"
                          : "#ffe8e8",
                    color:
                      r.status === "resolved"
                        ? "#00884a"
                        : r.status === "reviewed"
                          ? "#b45309"
                          : "#cc0000",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: 700,
                  }}
                >
                  {r.status}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginBottom: "10px",
                  flexWrap: "wrap",
                }}
              >
                {r.status === "pending" && (
                  <button
                    onClick={() => updateReportStatus(r._id, "reviewed")}
                    disabled={updatingId === r._id}
                    style={{
                      border: "none",
                      borderRadius: "16px",
                      padding: "6px 12px",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      background: "#fff8e8",
                      color: "#b45309",
                    }}
                  >
                    {updatingId === r._id ? "Updating..." : "Mark Reviewed"}
                  </button>
                )}

                {r.status === "resolved" && (
                  <button
                    onClick={() => updateReportStatus(r._id, "pending")}
                    disabled={updatingId === r._id}
                    style={{
                      border: "none",
                      borderRadius: "16px",
                      padding: "6px 12px",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      background: "#e8f0fe",
                      color: "#1d4ed8",
                    }}
                  >
                    {updatingId === r._id ? "Updating..." : "Reopen"}
                  </button>
                )}

                {r.status !== "resolved" && (
                  <button
                    onClick={() => updateReportStatus(r._id, "resolved")}
                    disabled={updatingId === r._id}
                    style={{
                      border: "none",
                      borderRadius: "16px",
                      padding: "6px 12px",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      background: "#e8fff0",
                      color: "#00884a",
                    }}
                  >
                    {updatingId === r._id ? "Updating..." : "Resolve"}
                  </button>
                )}
              </div>

              <p
                style={{
                  fontSize: "13px",
                  color: "#444",
                  marginBottom: "14px",
                }}
              >
                {r.description}
              </p>

              {r.image_url && (
                <a
                  href={`https://bracu-bus-portal.onrender.com${r.image_url}`}
                  target="_blank"
                >
                  <img
                    src={`https://bracu-bus-portal.onrender.com${r.image_url}`}
                    style={{
                      width: "60px",
                      height: "60px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      marginBottom: "12px",
                    }}
                    alt="evidence"
                  />
                </a>
              )}

              {/* Credibility bar */}
              <div style={{ marginTop: "8px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "6px",
                  }}
                >
                  <span
                    style={{ fontSize: "12px", fontWeight: 700, color: "#555" }}
                  >
                    Credibility Score
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 800,
                      color: getCredibilityColor(r.credibility),
                    }}
                  >
                    {r.credibility}% {getCredibilityLabel(r.credibility)}
                  </span>
                </div>
                <div
                  style={{
                    background: "#f0f0f0",
                    borderRadius: "10px",
                    height: "10px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${r.credibility}%`,
                      height: "100%",
                      background: getCredibilityColor(r.credibility),
                      borderRadius: "10px",
                      transition: "width 0.5s ease",
                    }}
                  />
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#444",
                    marginTop: "8px",
                    fontWeight: 700,
                  }}
                >
                  {getCredibilityIcon(r.credibility)} This report has{" "}
                  {r.credibility}% credibility score
                </div>
                <div
                  style={{ fontSize: "11px", color: "#888", marginTop: "4px" }}
                >
                  Based on {r.totalFeedbacks} feedbacks for {r.route_name} (
                  {r.negativeFeedbacks} negative)
                </div>
                <div
                  style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}
                >
                  Previous reports on this route: {r.previousReportsForRoute}
                </div>
                <div
                  style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}
                >
                  Sentiment for this route: {r.sentiment}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {view === "charts" && (
        <div>
          {/* Bar Chart - Bus Credibility */}
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "24px",
              marginBottom: "20px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
            }}
          >
            <h3
              style={{
                fontSize: "15px",
                fontWeight: 800,
                color: "#1a1a2e",
                marginBottom: "20px",
              }}
            >
              📊 Report Credibility by Bus
            </h3>
            {busEntries.length === 0 && (
              <p style={{ color: "#aaa", textAlign: "center" }}>No data yet.</p>
            )}
            {busChartData.length > 0 && (
              <div style={{ width: "100%", overflowX: "auto" }}>
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  style={{ width: "100%", minWidth: "660px", height: "300px" }}
                >
                  {chartTickValues.map((tick) => {
                    const y =
                      margin.top + plotHeight - (tick / 100) * plotHeight;
                    return (
                      <g key={tick}>
                        <line
                          x1={margin.left}
                          y1={y}
                          x2={margin.left + plotWidth}
                          y2={y}
                          stroke="#e5e7eb"
                          strokeWidth="1"
                        />
                        <text
                          x={margin.left - 10}
                          y={y + 4}
                          textAnchor="end"
                          fontSize="11"
                          fill="#6b7280"
                        >
                          {tick}
                        </text>
                      </g>
                    );
                  })}

                  <line
                    x1={margin.left}
                    y1={margin.top}
                    x2={margin.left}
                    y2={margin.top + plotHeight}
                    stroke="#9ca3af"
                    strokeWidth="1.5"
                  />
                  <line
                    x1={margin.left}
                    y1={margin.top + plotHeight}
                    x2={margin.left + plotWidth}
                    y2={margin.top + plotHeight}
                    stroke="#9ca3af"
                    strokeWidth="1.5"
                  />

                  <text x={16} y={margin.top - 6} fontSize="11" fill="#6b7280">
                    Credibility %
                  </text>

                  {busChartData.map((item, index) => {
                    const x = margin.left + index * (barWidth + barGap);
                    const barHeight = (item.credibility / 100) * plotHeight;
                    const y = margin.top + plotHeight - barHeight;
                    return (
                      <g key={item.bus}>
                        <rect
                          x={x}
                          y={y}
                          width={barWidth}
                          height={barHeight}
                          rx="4"
                          fill={getCredibilityColor(item.credibility)}
                        />
                        <text
                          x={x + barWidth / 2}
                          y={Math.max(y - 8, margin.top + 10)}
                          textAnchor="middle"
                          fontSize="11"
                          fontWeight="700"
                          fill="#1f2937"
                        >
                          {item.credibility}%
                        </text>
                        <text
                          x={x + barWidth / 2}
                          y={margin.top + plotHeight + 18}
                          textAnchor="middle"
                          fontSize="12"
                          fontWeight="700"
                          fill="#1f2937"
                        >
                          {item.bus}
                        </text>
                        <text
                          x={x + barWidth / 2}
                          y={margin.top + plotHeight + 34}
                          textAnchor="middle"
                          fontSize="11"
                          fill="#6b7280"
                        >
                          ({item.reports})
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            )}
          </div>

          {/* Pie Chart — Report Status */}
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "24px",
              marginBottom: "20px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
            }}
          >
            <h3
              style={{
                fontSize: "15px",
                fontWeight: 800,
                color: "#1a1a2e",
                marginBottom: "20px",
              }}
            >
              🥧 Report Status Breakdown
            </h3>
            <div
              style={{
                display: "flex",
                gap: "16px",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              {[
                {
                  label: "Pending",
                  count: data.statusSummary.pending,
                  color: "#fca5a5",
                },
                {
                  label: "Reviewed",
                  count: data.statusSummary.reviewed,
                  color: "#fcd34d",
                },
                {
                  label: "Resolved",
                  count: data.statusSummary.resolved,
                  color: "#86efac",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{ textAlign: "center", minWidth: "120px" }}
                >
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      background: `conic-gradient(${item.color} ${(item.count / Math.max(data.totalReports, 1)) * 360}deg, #f0f0f0 0deg)`,
                      margin: "0 auto 12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                      fontWeight: 800,
                      color: "#1a1a2e",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  >
                    {item.count}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: item.color,
                    }}
                  >
                    {item.label}
                  </div>
                  <div style={{ fontSize: "12px", color: "#aaa" }}>
                    {data.totalReports > 0
                      ? Math.round((item.count / data.totalReports) * 100)
                      : 0}
                    %
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Issue Type Breakdown */}
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
            }}
          >
            <h3
              style={{
                fontSize: "15px",
                fontWeight: 800,
                color: "#1a1a2e",
                marginBottom: "20px",
              }}
            >
              📋 Issue Types
            </h3>
            {(() => {
              const issueCount = {};
              data.reports.forEach((r) => {
                issueCount[r.issue_type] = (issueCount[r.issue_type] || 0) + 1;
              });
              const maxCount = Math.max(...Object.values(issueCount), 1);
              return Object.entries(issueCount).map(([issue, count]) => (
                <div key={issue} style={{ marginBottom: "14px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "6px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#1a1a2e",
                      }}
                    >
                      {issue}
                    </span>
                    <span style={{ fontSize: "13px", color: "#666" }}>
                      {count} reports
                    </span>
                  </div>
                  <div
                    style={{
                      background: "#f0f0f0",
                      borderRadius: "10px",
                      height: "10px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${(count / maxCount) * 100}%`,
                        height: "100%",
                        background: "#6c63ff",
                        borderRadius: "10px",
                      }}
                    />
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
