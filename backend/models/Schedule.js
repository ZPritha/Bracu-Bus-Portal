const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  route_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true
  },
  schedule_ID: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString(),
    unique: true
  },
  stoppage_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stoppage',
    required: true
  },
  first_pickup_time: {
    type: String,
    required: true
  },
  second_pickup_time: {
    type: String,
    required: true
  },
  first_departure_time: {
    type: String,
    required: true
  },
  second_departure_time: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Schedule', scheduleSchema);