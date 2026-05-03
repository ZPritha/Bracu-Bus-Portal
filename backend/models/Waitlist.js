const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  plan_name: { type: String, required: true },
  plan_fare: { type: Number, required: true },
  plan_stoppage_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Stoppage' },
  plan_stoppage_name: { type: String },
  plan_route_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
  plan_route_name: { type: String },
  selected_pickup_time: { type: String, default: null },
  selected_departure_time: { type: String, default: null },
  payment_method: { type: String, enum: ['bkash', 'nagad', 'cash', 'sslcommerz'], required: true },
  travel_date: { type: Date, default: Date.now },
  // Slot the waitlist entry is waiting for
  slot_type: { type: String, enum: ['pickup', 'departure', 'both'], required: true },
  status: { type: String, enum: ['waiting', 'promoted', 'expired'], default: 'waiting' },
  promoted_booking_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null }
}, { timestamps: true });

module.exports = mongoose.model('Waitlist', waitlistSchema);