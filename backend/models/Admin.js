const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  adminId:   { type: String, required: true, unique: true },
  name:      { type: String, required: true, trim: true },
  email:     { type: String, unique: true, sparse: true, trim: true },
  password:  { type: String, required: true },
  role:      { type: String, trim: true, default: 'admin' },
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);