const mongoose = require('mongoose');
require('dotenv').config();
const Schedule = require('./backend/models/Schedule');

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const count = await Schedule.countDocuments();
    console.log('Total schedules:', count);
    const latest = await Schedule.find().sort({ _id: -1 }).limit(1);
    console.log('Latest schedule:', JSON.stringify(latest, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();
