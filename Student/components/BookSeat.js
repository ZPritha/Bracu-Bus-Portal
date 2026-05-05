/*function BookSeat({ setActive, setFare }) {
  const [routes, setRoutes] = React.useState([]);
  const [stoppages, setStoppages] = React.useState([]);
  const [route, setRoute] = React.useState("");
  const [stop, setStop] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  // Fetch all routes on load
  React.useEffect(() => {
    fetch("https://bracu-bus-portal.onrender.com/api/routes")
      .then(res => res.json())
      .then(data => {
        setRoutes(data);
        setLoading(false);
      })
      .catch(err => {
        console.log("Error fetching routes:", err);
        setLoading(false);
      });
  }, []);

  // Fetch stoppages when route changes
  React.useEffect(() => {
    if (!route) {
      setStoppages([]);
      setStop("");
      return;
    }
    fetch(`https://bracu-bus-portal.onrender.com/api/stoppages/${route}`)
      .then(res => res.json())
      .then(data => {
        console.log("All stoppages:", data);
        console.log("Selected route _id:", route);
        console.log("First stoppage route_id:", data[0]?.route_id);
const filtered = data.filter(s => String(s.route_id) === String(route));
        console.log("Filtered:", filtered);
        setStoppages(filtered);
        setStop("");
      })
      .catch(err => console.log("Error fetching stoppages:", err));
  }, [route]);

  const selectedStop = stop !== "" ? stoppages[stop] : null;

  if (loading) return (
    <div className="content">
      <p style={{padding: "20px"}}>Loading routes...</p>
    </div>
  );

  return (
    <div className="content">
      <div className="section-label">Book a Seat</div>

      <div className="journey-card">
        <h2 className="journey-title">Your Journey Details</h2>

        <p className="journey-step-label">Step 1 — Select Route</p>
        <select className="journey-select" value={route} onChange={(e) => { setRoute(e.target.value); setStop(""); }}>
          <option value="">— Select a route —</option>
          {routes.map(r => (
            <option key={r._id} value={r._id}>{r.route_name}</option>
          ))}
        </select>

        <p className="journey-step-label">Step 2 — Select Stoppage</p>
        <select className="journey-select" value={stop} onChange={(e) => setStop(e.target.value)} disabled={!route}>
          <option value="">— Select a stoppage —</option>
          {stoppages.map((s, i) => (
            <option key={s._id} value={i}>{s.stoppage_name}</option>
          ))}
        </select>

        {selectedStop && (
          <div className="fare-box">
            <p className="fare-amount" style={{fontSize: "15px"}}>

            </p>
          </div>
        )}

        <button
          className="proceed-btn"
          disabled={!selectedStop}
          onClick={() => {
            setActive("Choose Plan");
            setFare(20); // hardcoded for now, fare not in DB yet
          }}>
          Proceed to Choose a Plan →
        </button>
      </div>
    </div>
  );
}*/

function BookSeat({ setActive, setFare, setBookingInfo }) {
  const BRACU_LAT = 23.7781;
  const BRACU_LNG = 90.4322;
  const ORS_API_KEY =
    "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjY4OWIzNmEzNTQ3NjRkYmI5ODQ5MmQwNWJmODVlNjA2IiwiaCI6Im11cm11cjY0In0=";

  const [routes, setRoutes] = React.useState([]);
  const [stoppages, setStoppages] = React.useState([]);
  const [route, setRoute] = React.useState("");
  const [stop, setStop] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [distance, setDistance] = React.useState(null);
  const [distanceLoading, setDistanceLoading] = React.useState(false);
  const mapRef = React.useRef(null);
  const leafletMap = React.useRef(null);

  // Fetch routes
  React.useEffect(() => {
    fetch("https://bracu-bus-portal.onrender.com/api/routes")
      .then((res) => res.json())
      .then((data) => {
        setRoutes(data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  // Fetch stoppages when route changes
  React.useEffect(() => {
    if (!route) {
      setStoppages([]);
      setStop("");
      setDistance(null);
      return;
    }
    // CORRECT — fetch all stoppages then filter by route
    fetch(`https://bracu-bus-portal.onrender.com/api/stoppages`)
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter(
          (s) => String(s.route_id) === String(route),
        );
        setStoppages(filtered);
        setStop("");
        setDistance(null);
      })
      .catch((err) => console.log("Error fetching stoppages:", err));
  }, [route]);

  // Auto calculate distance + show map when stoppage selected
  React.useEffect(() => {
    const selectedStop = stop !== "" ? stoppages[stop] : null;
    if (!selectedStop || !selectedStop.lat) {
      setDistance(null);
      return;
    }

    setDistanceLoading(true);
    setDistance(null);

    // Call ORS with stoppage coords → BRAC University
    fetch("https://api.openrouteservice.org/v2/directions/driving-car", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: ORS_API_KEY,
      },
      body: JSON.stringify({
        coordinates: [
          [selectedStop.lng, selectedStop.lat],
          [BRACU_LNG, BRACU_LAT],
        ],
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        const metres = data.routes[0].summary.distance;
        const km = (metres / 1000).toFixed(1);
        setDistance(km);
        setDistanceLoading(false);

        // Show map
        setTimeout(() => {
          if (!mapRef.current) return;
          if (leafletMap.current) {
            leafletMap.current.remove();
          }

          const map = L.map(mapRef.current).setView(
            [
              (selectedStop.lat + BRACU_LAT) / 2,
              (selectedStop.lng + BRACU_LNG) / 2,
            ],
            12,
          );

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap",
          }).addTo(map);

          // Stoppage marker
          L.marker([selectedStop.lat, selectedStop.lng])
            .addTo(map)
            .bindPopup(selectedStop.stoppage_name)
            .openPopup();

          // BRAC University marker
          L.marker([BRACU_LAT, BRACU_LNG])
            .addTo(map)
            .bindPopup("🏫 BRAC University");

          // Draw road route
          const coords = data.routes[0].geometry.coordinates;
          const latLngs = coords.map((c) => [c[1], c[0]]);
          L.polyline(latLngs, { color: "#6c63ff", weight: 4 }).addTo(map);

          map.fitBounds(L.polyline(latLngs).getBounds(), { padding: [30, 30] });

          leafletMap.current = map;
        }, 100);
      })
      .catch((err) => {
        console.log("ORS error:", err);
        setDistanceLoading(false);
      });
  }, [stop]);

  const selectedStop = stop !== "" ? stoppages[stop] : null;
  const fare = distance ? Math.round(distance * 5) : 0;

  if (loading)
    return (
      <div className="content">
        <p style={{ padding: "20px" }}>Loading routes...</p>
      </div>
    );

  return (
    <div className="content">
      <div className="section-label">Book a Seat</div>
      <div className="journey-card">
        <h2 className="journey-title">Your Journey Details</h2>

        <p className="journey-step-label">Step 1 — Select Route</p>
        <select
          className="journey-select"
          value={route}
          onChange={(e) => {
            setRoute(e.target.value);
            setStop("");
          }}
        >
          <option value="">— Select a route —</option>
          {routes.map((r) => (
            <option key={r._id} value={r._id}>
              {r.route_name}
            </option>
          ))}
        </select>

        <p className="journey-step-label">Step 2 — Select Stoppage</p>
        <select
          className="journey-select"
          value={stop}
          onChange={(e) => setStop(e.target.value)}
          disabled={!route}
        >
          <option value="">— Select a stoppage —</option>
          {stoppages.map((s, i) => (
            <option key={s._id} value={i}>
              {s.stoppage_name}
            </option>
          ))}
        </select>

        {selectedStop && (
          <div>
            {/* Map */}
            <div
              ref={mapRef}
              style={{
                height: "260px",
                borderRadius: "12px",
                margin: "16px 0",
                zIndex: 1,
              }}
            ></div>

            {distanceLoading && (
              <div className="fare-box">
                <p className="fare-label">Calculating road distance...</p>
              </div>
            )}

            {distance && !distanceLoading && (
              <div className="fare-box">
                <p className="fare-label">Distance-based fare per ride</p>
                <p className="fare-amount">৳{fare}</p>
                <p className="fare-note">
                  {distance} km × ৳5/km (road distance)
                </p>
              </div>
            )}
          </div>
        )}

        <button
          className="proceed-btn"
          disabled={!selectedStop || !distance}
          onClick={() => {
            setActive("Choose Plan");
            setFare(fare);
            setBookingInfo({
              // ← ADD
              route_id: route, // ← ADD
              route_name: routes.find((r) => r._id === route)?.route_name, // ← ADD
              stoppage_id: selectedStop._id, // ← ADD
              stoppage_name: selectedStop.stoppage_name, // ← ADD
            }); // ← ADD
          }}
        >
          Proceed to Choose a Plan →
        </button>
      </div>
    </div>
  );
}
