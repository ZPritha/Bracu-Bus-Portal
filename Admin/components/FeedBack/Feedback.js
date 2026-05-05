function Feedback({ setActive }) {
  const [feedbacks, setFeedbacks] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("https://bracu-bus-portal.onrender.com/api/feedbacks")
      .then((res) => res.json())
      .then((data) => {
        setFeedbacks(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load feedbacks", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="content">
      <div className="section-label">Feedback</div>
      {loading ? (
        <p className="empty-text">Loading feedbacks...</p>
      ) : (
        <FeedbackList feedbacks={feedbacks} />
      )}
    </div>
  );
}
