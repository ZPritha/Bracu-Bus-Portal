const mongoose = require('mongoose');
require('dotenv').config();
const Plan = require('./models/Plan');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await Plan.deleteMany({});
  await Plan.insertMany([
    { name: "No Plan", desc: "Pay per ride", sub: "1 ride per day", rides_per_day: 1, discount_percent: 0, badge: null, badge_class: null, order: 1 },
    { name: "One Way", desc: "1 ride/day, no per-trip payment", sub: "1 ride per day", rides_per_day: 1, discount_percent: 15, badge: "Popular", badge_class: "badge-popular", order: 2 },
    { name: "Round Trip", desc: "2 rides/day, no per-trip payment", sub: "Pick-up + departure daily", rides_per_day: 2, discount_percent: 20, badge: "Best Deal", badge_class: "badge-deal", order: 3 },
  ]);
  console.log("✅ Plans seeded!");
  mongoose.disconnect();
});

