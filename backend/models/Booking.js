const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  tran_id: { type: String, default: null },
  travel_date: { type: Date, default: Date.now },
  user_id: { type: String, default: null },
  plan_name: { type: String, default: null },
  plan_fare: { type: Number, default: null },
  plan_stoppage_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Stoppage', default: null },
  plan_stoppage_name: { type: String, default: null },
  plan_route_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', default: null },
  plan_route_name: { type: String, default: null },
  plan_expires_at: { type: Date, default: null },
  selected_pickup_time: { type: String },
  selected_departure_time: { type: String },
  payment_method: { type: String, enum: ['bkash', 'nagad', 'cash', 'sslcommerz'], required: true },
  status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);