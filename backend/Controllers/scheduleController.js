const Schedule = require('../models/Schedule');

// Get all schedules (populated)
exports.getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate('route_id', 'route_name')
      .populate('stoppage_id', 'stoppage_name');
    res.status(200).json(schedules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get schedules filtered by route and/or stoppage
exports.getSchedules = async (req, res) => {
  try {
    const { route_id, stoppage_id } = req.query;
    const filter = {};
    if (route_id) filter.route_id = route_id;
    if (stoppage_id) filter.stoppage_id = stoppage_id;

    const schedules = await Schedule.find(filter)
      .populate('route_id', 'route_name')
      .populate('stoppage_id', 'stoppage_name');
    res.status(200).json(schedules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new schedule
exports.createSchedule = async (req, res) => {
  try {
    const {
      route_id,
      stoppage_id,
      first_pickup_time,
      second_pickup_time,
      first_departure_time,
      second_departure_time
    } = req.body;

    if (!route_id || !stoppage_id || !first_pickup_time || !second_pickup_time || !first_departure_time || !second_departure_time) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const schedule = new Schedule({
      route_id,
      stoppage_id,
      first_pickup_time,
      second_pickup_time,
      first_departure_time,
      second_departure_time
    });

    const saved = await schedule.save();
    
    // Use findById for more robust population
    const populated = await Schedule.findById(saved._id)
      .populate('route_id')
      .populate('stoppage_id');
      
    res.status(201).json(populated);
  } catch (err) {
    console.error('Error creating schedule:', err);
    res.status(400).json({ error: err.message });
  }
};

// Update a schedule
exports.updateSchedule = async (req, res) => {
  try {
    const updated = await Schedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
      .populate('route_id', 'route_name')
      .populate('stoppage_id', 'stoppage_name');

    if (!updated) return res.status(404).json({ error: 'Schedule not found' });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a schedule
exports.deleteSchedule = async (req, res) => {
  try {
    const deleted = await Schedule.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Schedule not found' });
    res.status(200).json({ message: 'Schedule deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get schedule by stoppage_id
exports.getScheduleByStoppage = async (req, res) => {
  try {
    const schedule = await Schedule.findOne({ stoppage_id: req.params.stoppage_id });
    if (!schedule) return res.status(404).json({ error: 'No schedule found for this stoppage.' });
    res.status(200).json(schedule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};