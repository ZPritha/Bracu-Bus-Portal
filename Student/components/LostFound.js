function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function ReportLostModal({ onClose, onSubmit, currentUser }) {
  const [itemName, setItemName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [busNumber, setBusNumber] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [buses, setBuses] = React.useState([]);

  React.useEffect(() => {
    fetch("https://bracu-bus-portal.onrender.com/api/buses")
      .then((res) => res.json())
      .then((data) => setBuses(data))
      .catch((err) => console.log(err));
  }, []);

  async function handleSubmit() {
    if (!itemName || !description) {
      alert("Please fill in item name and description.");
      return;
    }
    try {
      const res = await fetch(
        "https://bracu-bus-portal.onrender.com/api/lostfound",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "lost",
            studentId: currentUser.studentId,
            itemName,
            description,
            busNumber,
            location,
          }),
        },
      );
      const data = await res.json();
      onSubmit(data);
    } catch (err) {
      alert("Server error. Is backend running?");
    }
  }

  return (
    <div className="lf-modal-overlay" onClick={onClose}>
      <div className="lf-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="lf-modal-header">
          <span className="lf-modal-title">Report Lost Item</span>
          <button className="lf-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <input
          className="lf-input"
          placeholder="Enter Your ID"
          value={currentUser.studentId}
          readOnly
        />
        <input
          className="lf-input"
          placeholder="Lost Item (e.g. Wallet)"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
        />
        <select
          className="lf-input"
          value={busNumber}
          onChange={(e) => setBusNumber(e.target.value)}
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
        <input
          className="lf-input"
          placeholder="Location (e.g. Mirpur → BRACU)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <textarea
          className="lf-textarea"
          placeholder="Item Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button className="lf-submit-btn" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
}

function ReportFoundModal({ onClose, onSubmit, currentUser }) {
  const [itemName, setItemName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [busNumber, setBusNumber] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [specialMark, setSpecialMark] = React.useState("");
  const [image, setImage] = React.useState("");
  const [buses, setBuses] = React.useState([]);

  React.useEffect(() => {
    fetch("https://bracu-bus-portal.onrender.com/api/buses")
      .then((res) => res.json())
      .then((data) => setBuses(data))
      .catch((err) => console.log(err));
  }, []);

  function handleImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result);
    reader.readAsDataURL(file);
  }

  async function handleSubmit() {
    if (!itemName || !description) {
      alert("Please fill in item name and description.");
      return;
    }
    try {
      const res = await fetch(
        "https://bracu-bus-portal.onrender.com/api/lostfound",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "found",
            studentId: currentUser.studentId,
            itemName,
            description,
            busNumber,
            location,
            specialMark,
            image,
          }),
        },
      );
      const data = await res.json();
      onSubmit(data);
    } catch (err) {
      alert("Server error. Is backend running?");
    }
  }

  return (
    <div className="lf-modal-overlay" onClick={onClose}>
      <div className="lf-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="lf-modal-header">
          <span className="lf-modal-title">Report Found Item</span>
          <button className="lf-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <input
          className="lf-input"
          placeholder="Your ID"
          value={currentUser.studentId}
          readOnly
        />
        <div className="lf-image-upload">
          <label className="lf-image-label">
            {image ? (
              <img src={image} className="lf-image-preview" alt="preview" />
            ) : (
              <span>📷 Click to Upload Picture</span>
            )}
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImage}
            />
          </label>
        </div>
        <input
          className="lf-input"
          placeholder="Item Name (e.g. Water Bottle)"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
        />
        <select
          className="lf-input"
          value={busNumber}
          onChange={(e) => setBusNumber(e.target.value)}
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
        <input
          className="lf-input"
          placeholder="Enter Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <input
          className="lf-input"
          placeholder="Add Item Detail or Special Mark"
          value={specialMark}
          onChange={(e) => setSpecialMark(e.target.value)}
        />
        <textarea
          className="lf-textarea"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button className="lf-submit-btn" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
}

function PostDetailModal({ post, onClose, currentUser, onPostUpdate }) {
  const [commentText, setCommentText] = React.useState("");

  async function handleComment() {
    if (!commentText.trim()) return;
    try {
      const res = await fetch(
        `https://bracu-bus-portal.onrender.com/api/lostfound/${post._id}/comment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            postedBy: currentUser.studentId,
            text: commentText,
          }),
        },
      );
      const updated = await res.json();
      onPostUpdate(updated);
      setCommentText("");
    } catch (err) {
      alert("Failed to post comment.");
    }
  }

  async function handleResolve() {
    try {
      const res = await fetch(
        `https://bracu-bus-portal.onrender.com/api/lostfound/${post._id}/resolve`,
        { method: "PATCH" },
      );
      const updated = await res.json();
      onPostUpdate(updated);
    } catch (err) {
      alert("Failed to resolve.");
    }
  }

  // ← FIXED: strict string comparison
  const isOwner = String(post.studentId) === String(currentUser.studentId);

  return (
    <div className="lf-modal-overlay" onClick={onClose}>
      <div className="lf-detail-box" onClick={(e) => e.stopPropagation()}>
        <div className="lf-modal-header">
          <span className="lf-modal-title">
            {post.type === "lost" ? "🔴 Lost Report" : "🟢 Found Report"}
          </span>
          <button className="lf-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="lf-detail-poster">
          <span className="lf-student-id">{post.studentId}</span>
          <span className="lf-posted-label"> Posted</span>
          <span className="lf-time"> · {timeAgo(post.createdAt)}</span>
          <span className={`lf-status-badge ${post.status}`}>
            {post.status === "open" ? "Open" : "Resolved"}
          </span>
        </div>

        {post.image && (
          <img src={post.image} className="lf-detail-image" alt="item" />
        )}

        <div className="lf-detail-row">
          <span className="lf-detail-label">Lost Item:</span>
          <span className="lf-detail-value">{post.itemName}</span>
        </div>
        {post.busNumber && (
          <div className="lf-detail-row">
            <span className="lf-detail-label">Bus:</span>
            <span className="lf-detail-value">{post.busNumber}</span>
          </div>
        )}
        {post.location && (
          <div className="lf-detail-row">
            <span className="lf-detail-label">Location:</span>
            <span className="lf-detail-value">{post.location}</span>
          </div>
        )}
        {post.specialMark && (
          <div className="lf-detail-row">
            <span className="lf-detail-label">Special Mark:</span>
            <span className="lf-detail-value">{post.specialMark}</span>
          </div>
        )}
        <div className="lf-detail-row">
          <span className="lf-detail-label">Description:</span>
          <span className="lf-detail-value">{post.description}</span>
        </div>

        {/* ← FIXED: only post owner can resolve */}
        {post.status === "open" && isOwner && (
          <button className="lf-resolve-btn" onClick={handleResolve}>
            ✅ Mark as Resolved
          </button>
        )}

        <div className="lf-comments-section">
          <div className="lf-comments-title">Comments</div>
          {post.comments.length === 0 && (
            <div className="lf-no-comments">No comments yet.</div>
          )}
          {post.comments.map((c, i) => (
            <div className="lf-comment" key={i}>
              <span className="lf-student-id">{c.postedBy}</span>
              <span className="lf-posted-label"> Commented</span>
              <div className="lf-comment-text">{c.text}</div>
            </div>
          ))}
          <div className="lf-comment-input-row">
            <input
              className="lf-comment-input"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button className="lf-comment-btn" onClick={handleComment}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LostFound({ currentUser, setActive }) {
  const [posts, setPosts] = React.useState([]);
  const [showLostModal, setShowLostModal] = React.useState(false);
  const [showFoundModal, setShowFoundModal] = React.useState(false);
  const [selectedPost, setSelectedPost] = React.useState(null);

  React.useEffect(() => {
    fetch("https://bracu-bus-portal.onrender.com/api/lostfound")
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((err) => console.log(err));
  }, []);

  const lostPosts = posts.filter((p) => p.type === "lost");
  const foundPosts = posts.filter((p) => p.type === "found");

  function handleNewPost(post) {
    setPosts((prev) => [post, ...prev]);
    setShowLostModal(false);
    setShowFoundModal(false);
  }

  function handlePostUpdate(updated) {
    setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
    setSelectedPost(updated);
  }

  return (
    <div className="content">
      <button className="back-btn" onClick={() => setActive("Dashboard")}>
        ← Back
      </button>
      <div className="section-label">Lost & Found</div>
      <p className="lf-subtitle">
        Report or claim items lost during your bus journey. View found items,
        submit a lost item report and get updates when your belongings are
        recovered.
      </p>

      <div className="lf-action-row">
        <button
          className="lf-btn-found"
          onClick={() => setShowFoundModal(true)}
        >
          Found Items
        </button>
        <button className="lf-btn-lost" onClick={() => setShowLostModal(true)}>
          Report Lost Items
        </button>
      </div>

      <div className="lf-section">
        <div className="lf-section-header">
          <span>⚠️</span>
          <h3>Recent lost reports</h3>
        </div>
        {lostPosts.length === 0 && (
          <div className="lf-empty">No lost reports yet.</div>
        )}
        {lostPosts.map((p) => (
          <div
            className="lf-lost-card"
            key={p._id}
            onClick={() => setSelectedPost(p)}
          >
            <div className="lf-card-top">
              <span className="lf-card-title">
                {p.busNumber ? `Bus ${p.busNumber}` : p.itemName}
              </span>
              <span className={`lf-status-badge ${p.status}`}>
                {p.status === "open" ? "Open" : "Resolved"}
              </span>
            </div>
            <div className="lf-card-sub">
              Student ID: {p.studentId} · {timeAgo(p.createdAt)}
            </div>
          </div>
        ))}
      </div>

      <div className="lf-section">
        <div className="lf-section-header">
          <h3>Recent found items</h3>
        </div>
        {foundPosts.length === 0 && (
          <div className="lf-empty">No found items yet.</div>
        )}
        {foundPosts.map((p) => (
          <div
            className="lf-found-card"
            key={p._id}
            onClick={() => setSelectedPost(p)}
          >
            <div className="lf-card-top">
              <span className="lf-card-title">{p.itemName}</span>
              <span className={`lf-status-badge ${p.status}`}>
                {p.status === "open" ? "Open" : "Resolved"}
              </span>
            </div>
            <div className="lf-card-sub">
              ID: {p.studentId} · {timeAgo(p.createdAt)}
            </div>
          </div>
        ))}
      </div>

      {showLostModal && (
        <ReportLostModal
          onClose={() => setShowLostModal(false)}
          onSubmit={handleNewPost}
          currentUser={currentUser}
        />
      )}
      {showFoundModal && (
        <ReportFoundModal
          onClose={() => setShowFoundModal(false)}
          onSubmit={handleNewPost}
          currentUser={currentUser}
        />
      )}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          currentUser={currentUser}
          onPostUpdate={handlePostUpdate}
        />
      )}
    </div>
  );
}
