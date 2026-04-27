const Route = require('../models/Route');
const Bus = require('../models/Bus');

// Create a new route + auto-create bus
exports.createRoute = async (req, res) => {
  try {
    // Create the route
    const newRoute = new Route(req.body);
    await newRoute.save();

    // Auto-generate bus number based on total bus count
    const busCount = await Bus.countDocuments();
    const busNumber = 'B' + String(busCount + 1).padStart(2, '0');

    // Auto-create bus assigned to this route
    const newBus = new Bus({
      bus_number: busNumber,
      route: newRoute._id,
      capacity: 40,
      is_active: true
    });
    await newBus.save();

    res.status(201).json({
      route: newRoute,
      bus: newBus,
      message: `Route created and ${busNumber} assigned automatically`
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all routes
exports.getAllRoutes = async (req, res) => {
  try {
    const routes = await Route.find();
    res.status(200).json(routes);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get a specific route by ID
exports.getRouteById = async (req, res) => {
  try {
    const route = await Route.findOne({ route_ID: req.params.id });
    if (!route) return res.status(404).json({ error: 'Route not found' });
    res.status(200).json(route);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update a route by ID
exports.updateRoute = async (req, res) => {
  try {
    const updatedRoute = await Route.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedRoute) return res.status(404).json({ error: 'Route not found' });
    res.status(200).json(updatedRoute);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a route + its assigned bus
exports.deleteRoute = async (req, res) => {
  try {
    const deletedRoute = await Route.findByIdAndDelete(req.params.id);
    if (!deletedRoute) return res.status(404).json({ error: 'Route not found' });

    // Also delete the bus assigned to this route
    await Bus.findOneAndDelete({ route: req.params.id });

    res.status(200).json({ message: 'Route and assigned bus deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};