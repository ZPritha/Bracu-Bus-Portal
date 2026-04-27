const express = require('express');
const router = express.Router();
const SOS = require('../models/SOS');

// POST - student triggers SOS
router.post('/', async (req, res) => {
  try {
    const { student_id, student_name, latitude, longitude, location_text } = req.body;
    const sos = new SOS({ student_id, student_name, latitude, longitude, location_text });
    await sos.save();
    res.status(201).json({ message: 'SOS alert sent successfully', sos });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET - admin views all active SOS alerts
router.get('/', async (req, res) => {
  try {
    const alerts = await SOS.find().sort({ createdAt: -1 });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH - admin acknowledges SOS
router.patch('/:id', async (req, res) => {
  try {
    const sos = await SOS.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(sos);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;