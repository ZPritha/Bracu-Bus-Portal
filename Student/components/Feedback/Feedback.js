function Feedback({ setActive, currentUser }) {
  const [view, setView] = React.useState("form");
  const [feedbacks, setFeedbacks] = React.useState([]);

  const fetchFeedbacks = async () => {
    try {
      const res = await fetch("http://localhost:9255/api/feedbacks");
      const data = await res.json();
      setFeedbacks(data);
    } catch (err) {
      console.error("Failed to load feedbacks", err);
    }
  };

  React.useEffect(() => {
    if (view === "list") fetchFeedbacks();
  }, [view]);

  return (
    <div className="feedback-wrapper">
      <div className="feedback-tab-bar">
        <button
          onClick={() => setView("form")}
          className={view === "form" ? "tab active" : "tab"}
        >
          Submit Feedback
        </button>
        <button
          onClick={() => setView("list")}
          className={view === "list" ? "tab active" : "tab"}
        >
          View Feedbacks
        </button>
      </div>

      {view === "form"
        ? <FeedbackForm currentUser={currentUser} />
        : <FeedbackList feedbacks={feedbacks} />
      }
    </div>
  );
}