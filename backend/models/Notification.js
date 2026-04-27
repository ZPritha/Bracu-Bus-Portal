const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  studentId:  { type: String, required: true },
  message:    { type: String, required: true },
  postId:     { type: mongoose.Schema.Types.ObjectId, ref: 'LostFound' },
  isRead:     { type: Boolean, default: false },
  createdAt:  { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);