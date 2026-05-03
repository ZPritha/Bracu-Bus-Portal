const BusLocation = require("../models/BusLocation");

exports.getBusLocationByRoute = async (req, res) => {
  try {
    const { routeId } = req.params;

    const locations = await BusLocation.find({ route_id: routeId })
      .populate("bus_id")
      .populate("route_id")
      .sort({ last_updated: -1 });

    res.json(locations);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch bus location" });
  }
};

exports.updateBusLocation = async (req, res) => {
  try {
    const { bus_id, route_id, latitude, longitude, speed } = req.body;

    const location = await BusLocation.findOneAndUpdate(
      { bus_id },
      {
        bus_id,
        route_id,
        latitude,
        longitude,
        speed,
        last_updated: new Date()
      },
      { upsert: true, new: true }
    );

    res.json(location);
  } catch (err) {
    res.status(500).json({ message: "Failed to update bus location" });
  }
};
