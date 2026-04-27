const express = require('express');
const stoppageController = require('../Controllers/stoppageController');
const router = express.Router();

router.post('/', stoppageController.createStoppage);
router.get('/', stoppageController.getAllStoppages);
router.get('/:id', stoppageController.getStoppageById);
router.put('/:id', stoppageController.updateStoppage);
router.delete('/:id', stoppageController.deleteStoppage);

module.exports = router;

// // Route to create a new stoppage
// router.post('/api/stoppages', stoppageController.createStoppage);

// // Route to get all stoppages
// router.get('/api/stoppages', stoppageController.getAllStoppages);

// // Route to get stoppage by ID
// router.get('/api/stoppages/:id', stoppageController.getStoppageById);

// // Route to update a stoppage by ID
// router.put('/api/stoppages/:id', stoppageController.updateStoppage);

// // Route to delete a stoppage by ID
// router.delete('/api/stoppages/:id', stoppageController.deleteStoppage);

// module.exports = router;
