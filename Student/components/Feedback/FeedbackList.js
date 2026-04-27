function renderStars(rating) {
  return '★'.repeat(Number(rating)) + '☆'.repeat(5 - Number(rating));
}

function FeedbackList({ feedbacks }) {
  if (!feedbacks.length) {
    return <p className="empty-text">No feedback submitted yet.</p>;
  }

  return (
    <div className="feedback-list">
      {feedbacks.map((item) => (
        <article key={item._id || item.id} className="feedback-card">
          <div className="feedback-top">
            <div>
              <h3>{item.Name}</h3>
              <p className="feedback-meta">{item.studentId} • {item.busRoute}</p>
            </div>
            <div className="rating-badge">{renderStars(item.rating)}</div>
          </div>

          <p className="feedback-message">{item.message}</p>

          <div className="feedback-details">
            
            
            {item.attachmentName ? <span>Attachment: {item.attachmentName}</span> : null}
          </div>
        </article>
      ))}
    </div>
  );
}