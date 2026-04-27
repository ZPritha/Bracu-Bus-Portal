const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');

// GET schedules by route and stoppage
router.get('/', async (req, res) => {
  try {
    const { route_id, stoppage_id } = req.query;
    const schedules = await Schedule.find({ route_id, stoppage_id });
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create a schedule
router.post('/', async (req, res) => {
  try {
    const schedule = new Schedule({
      route_id: req.body.route_id,
      stoppage_id: req.body.stoppage_id,
      first_pickup_time: req.body.first_pickup_time,
      second_pickup_time: req.body.second_pickup_time,
      first_departure_time: req.body.first_departure_time,
      second_departure_time: req.body.second_departure_time
    });
    const newSchedule = await schedule.save();
    res.status(201).json(newSchedule);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
// GET schedule by stoppage_id
router.get('/:stoppage_id', async (req, res) => {
  try {
    const schedule = await Schedule.findOne({ stoppage_id: req.params.stoppage_id });
    if (!schedule) return res.status(404).json({ error: 'No schedule found.' });
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;