const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  postedBy:  { type: String, required: true },
  text:      { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const lostFoundSchema = new mongoose.Schema({
  type:        { type: String, enum: ['lost', 'found'], required: true },
  studentId:   { type: String, required: true },
  itemName:    { type: String, required: true },
  description: { type: String, required: true },
  busNumber:   { type: String, default: '' },
  location:    { type: String, default: '' },
  specialMark: { type: String, default: '' },
  image:       { type: String, default: '' },
  status:      { type: String, enum: ['open', 'resolved'], default: 'open' },
  comments:    [commentSchema],
  createdAt:   { type: Date, default: Date.now }
});

module.exports = mongoose.model('LostFound', lostFoundSchema);