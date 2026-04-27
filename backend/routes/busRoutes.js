const express = require('express');
const router = express.Router();
const Bus = require('../models/Bus');
const Route = require('../models/Route');

// GET all buses with their populated routes
router.get('/', async (req, res) => {
  try {
    const buses = await Bus.find({ is_active: true }).populate('route', 'route_name');
    res.json(buses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET route for a specific bus
router.get('/:busId/route', async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.busId).populate('route', 'route_name');
    if (!bus) return res.status(404).json({ message: 'Bus not found' });
    res.json({ route: bus.route });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create a new bus
router.post('/', async (req, res) => {
  try {
    const { bus_number, route, capacity } = req.body;
    const bus = new Bus({ bus_number, route, capacity });
    const saved = await bus.save();
    await saved.populate('route', 'route_name');
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;