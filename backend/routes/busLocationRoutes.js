const express = require("express");
const router = express.Router();
const busLocationController = require("../Controllers/busLocationController");

router.get("/:routeId", busLocationController.getBusLocationByRoute);
router.post("/update", busLocationController.updateBusLocation);

module.exports = router;
