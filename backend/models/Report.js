/*const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  student_id: {
    type: String,
    required: true,
    trim: true
  },
  issue_type: {
    type: String,
    enum: ['Harassment', 'Safety Concern', 'Inappropriate Behaviour', 'Other'],
    required: true
  },
  bus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus',
    required: true
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);*/

/*const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  student_id: {
    type: String,
    required: true,
    trim: true
  },
  issue_type: {
    type: String,
    enum: ['Harassment', 'Safety Concern', 'Inappropriate Behaviour', 'Other'],
    required: true
  },
  bus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus',
    required: true
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  image_url: {          // ← ADD THIS
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);*/

const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  student_id: {
    type: String,
    required: true,
    trim: true
  },
  issue_type: {
    type: String,
    enum: ['Harassment', 'Safety Concern', 'Inappropriate Behaviour', 'Other'],
    required: true
  },
  bus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus',
    required: true
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  image_url: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'accepted'],  // ← added 'accepted'
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);