const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  name:           { type: String, required: true },
  studentId:      { type: String, required: true },
  busRoute:       { type: String, required: true },
  message:        { type: String, required: true },
  rating:         { type: Number, min: 1, max: 5 },
  attachmentName: { type: String, default: null },
  attachmentUrl:  { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
