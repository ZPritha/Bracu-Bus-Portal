const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: { type: String, required: true },        // "No Plan", "One Way", "Round Trip"
  desc: { type: String, required: true },
  sub: { type: String, required: true },
  rides_per_day: { type: Number, required: true }, // 1 or 2
  discount_percent: { type: Number, default: 0 },  // 0, 15, 20
  badge: { type: String, default: null },          // "Popular", "Best Deal", null
  badge_class: { type: String, default: null },    // "badge-popular", "badge-deal", null
  order: { type: Number, default: 0 }              // for sorting
});

module.exports = mongoose.model('Plan', planSchema);