const mongoose = require('mongoose');

const stoppageSchema = new mongoose.Schema({
  stoppage_name: {
    type: String,
    required: true
  },
  stoppage_order: {
    type: Number,
    required: true
  },
  route_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true
  },
  distance_km: {
    type: Number,
    required: true
  },
  lat: { type: Number},
  lng: { type: Number}
});

module.exports = mongoose.model('Stoppage', stoppageSchema);