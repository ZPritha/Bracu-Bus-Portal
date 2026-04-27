const mongoose = require('mongoose');

const sosSchema = new mongoose.Schema({
  student_id: { type: String, required: true },
  student_name: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  location_text: { type: String },
  status: {
    type: String,
    enum: ['active', 'acknowledged', 'resolved'],
    default: 'active'
  }
}, { timestamps: true });

module.exports = mongoose.model('SOS', sosSchema);