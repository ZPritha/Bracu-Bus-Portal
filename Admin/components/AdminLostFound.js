function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function AdminPostDetailModal({ post, onClose, onPostUpdate, onDelete }) {
  const [commentText, setCommentText] = React.useState("");

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

  async function handleDelete() {
    if (!confirm("Delete this post?")) return;
    try {
      await fetch(
        `https://bracu-bus-portal.onrender.com/api/lostfound/${post._id}`,
        {
          method: "DELETE",
        },
      );
      onDelete(post._id);
      onClose();
    } catch (err) {
      alert("Failed to delete.");
    }
  }

  async function handleComment() {
    if (!commentText.trim()) return;
    try {
      const res = await fetch(
        `https://bracu-bus-portal.onrender.com/api/lostfound/${post._id}/comment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            postedBy: "Admin",
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
          <span className="lf-detail-label">Item:</span>
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
        // Find this in AdminPostDetailModal and replace:
        <div style={{ display: "flex", gap: "10px", margin: "12px 0" }}>
          {post.status === "open" && (
            <button className="lf-resolve-btn" onClick={handleResolve}>
              ✅ Mark as Resolved
            </button>
          )}
          <button
            className="lf-resolve-btn"
            onClick={handleDelete}
            style={{ background: "#ffe8e8", color: "#cc0000" }}
          >
            🗑️ Delete Post
          </button>
        </div>
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
              placeholder="Write a comment as Admin..."
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

function AdminLostFound({ currentAdmin }) {
  const [posts, setPosts] = React.useState([]);
  const [filter, setFilter] = React.useState("all");
  const [selectedPost, setSelectedPost] = React.useState(null);

  React.useEffect(() => {
    fetch("https://bracu-bus-portal.onrender.com/api/lostfound")
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((err) => console.log(err));
  }, []);

  const filteredPosts = posts.filter((p) => {
    if (filter === "all") return true;
    if (filter === "lost") return p.type === "lost";
    if (filter === "found") return p.type === "found";
    if (filter === "open") return p.status === "open";
    if (filter === "resolved") return p.status === "resolved";
    return true;
  });

  function handlePostUpdate(updated) {
    setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
    setSelectedPost(updated);
  }

  function handleDelete(id) {
    setPosts((prev) => prev.filter((p) => p._id !== id));
  }

  return (
    <div className="content">
      <div className="section-label">Lost & Found</div>
      <p className="lf-subtitle">
        View and manage all lost & found reports. Resolve or delete
        inappropriate posts.
      </p>

      {/* Filter buttons */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        {["all", "lost", "found", "open", "resolved"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "8px 16px",
              borderRadius: "20px",
              border: "none",
              background: filter === f ? "#2e86de" : "#e8f0fe",
              color: filter === f ? "#fff" : "#333",
              fontWeight: "700",
              fontSize: "13px",
              cursor: "pointer",
              fontFamily: "Nunito, sans-serif",
              textTransform: "capitalize",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Posts list */}
      <div className="lf-section">
        {filteredPosts.length === 0 && (
          <div className="lf-empty">No posts found.</div>
        )}
        {filteredPosts.map((p) => (
          <div
            key={p._id}
            className={p.type === "lost" ? "lf-lost-card" : "lf-found-card"}
            onClick={() => setSelectedPost(p)}
          >
            <div className="lf-card-top">
              <span className="lf-card-title">
                {p.type === "lost" ? "🔴" : "🟢"} {p.itemName}
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

      {selectedPost && (
        <AdminPostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onPostUpdate={handlePostUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
