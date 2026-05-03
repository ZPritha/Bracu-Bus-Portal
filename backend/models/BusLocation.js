const mongoose = require("mongoose");

const busLocationSchema = new mongoose.Schema({
  bus_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bus",
    required: true
  },
  route_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Route",
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  speed: {
    type: Number,
    default: 0
  },
  last_updated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model("BusLocation", busLocationSchema);
