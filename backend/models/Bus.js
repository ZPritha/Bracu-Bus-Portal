const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  bus_number: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true
  },
  seats: {
    type: Number,
    default: 5
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Bus', busSchema);