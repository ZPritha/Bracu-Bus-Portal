const Feedback = require('../models/Feedback');

// POST /api/feedbacks
const submitFeedback = async (req, res) => {
  try {
    const { name, studentId, busRoute, message, rating } = req.body;

    const feedback = new Feedback({
      name,
      studentId,
      busRoute,
      message,
      rating: Number(rating),
      attachmentName: req.file ? req.file.originalname : null,
      attachmentUrl:  req.file ? req.file.path : null,
    });

    await feedback.save();
    res.status(201).json({ success: true, message: "Feedback submitted", feedback });

  } catch (error) {
    console.error("Feedback submit error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/feedbacks
const getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { submitFeedback, getFeedbacks };