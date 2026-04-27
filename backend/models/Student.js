const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId:        { type: String, required: true, unique: true },
  name:             { type: String, required: true },
  email:            { type: String, required: true, unique: true },
  password:         { type: String, required: true },
  department:       { type: String, required: true },
  semester:         { type: String, required: true },
  plan_name:        { type: String, default: null },
  plan_fare:        { type: Number, default: null },
  plan_stoppage_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Stoppage', default: null },
  plan_stoppage_name: { type: String, default: null },
  plan_route_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'Route', default: null },
  plan_route_name:  { type: String, default: null },
  plan_expires_at:  { type: Date, default: null },
  dismissedAnnouncements: [{ type: String }],  // ← new
  createdAt:        { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', studentSchema);