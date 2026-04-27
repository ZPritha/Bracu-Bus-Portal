const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title:     { type: String, required: true },
  message:   { type: String, required: true },
  category:  { type: String, required: true },
  busNumber: { type: String, default: '' },
  routeName: { type: String, default: '' },
  status:    { type: String, default: 'published' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Announcement', announcementSchema);