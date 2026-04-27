const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  route_name: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Route', routeSchema);