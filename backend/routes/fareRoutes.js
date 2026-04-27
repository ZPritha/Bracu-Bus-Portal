const express = require('express');
const router = express.Router();
const Stoppage = require('../models/Stoppage');

const RATE_PER_KM = 5; // ৳5 per km

// POST calculate fare
router.post('/calculate', async (req, res) => {
  try {
    const { route_id, stoppage_id } = req.body;

    // Find the stoppage to get distance
    const stoppage = await Stoppage.findById(stoppage_id);
    if (!stoppage) {
      return res.status(404).json({ message: 'Stoppage not found' });
    }

    const distance_km = stoppage.distance_km;
    const calculated_fare = distance_km * RATE_PER_KM;

    res.json({
      route_id,
      stoppage_id,
      stoppage_name: stoppage.stoppage_name,
      distance_km,
      rate_per_km: RATE_PER_KM,
      calculated_fare,
      note: 'In production, distance is fetched from Google Maps Distance Matrix API'
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;