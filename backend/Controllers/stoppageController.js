const mongoose = require('mongoose');
const Stoppage = require('../models/Stoppage');

exports.createStoppage = async (req, res) => {
  try {
    const { stoppage_name, stoppage_order, route_id, distance_km } = req.body;

    if (!stoppage_name || !stoppage_order || !route_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newStoppage = new Stoppage({
      stoppage_name,
      stoppage_order,
      route_id,
      distance_km: distance_km || 0
    });

    await newStoppage.save();
    res.status(201).json(newStoppage);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all stoppages
exports.getAllStoppages = async (req, res) => {
  try {
    const stoppages = await Stoppage.find();
    res.status(200).json(stoppages);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get a specific stoppage by ID
exports.getStoppageById = async (req, res) => {
  try {
    const stoppage = await Stoppage.findById(req.params.id);
    if (!stoppage) return res.status(404).json({ error: 'Stoppage not found' });
    res.status(200).json(stoppage);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update a stoppage by ID
exports.updateStoppage = async (req, res) => {
  try {
    const updatedStoppage = await Stoppage.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedStoppage) return res.status(404).json({ error: 'Stoppage not found' });
    res.status(200).json(updatedStoppage);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a stoppage by ID
exports.deleteStoppage = async (req, res) => {
  try {
    const deletedStoppage = await Stoppage.findByIdAndDelete(req.params.id);
    if (!deletedStoppage) return res.status(404).json({ error: 'Stoppage not found' });
    res.status(200).json({ message: 'Stoppage deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};