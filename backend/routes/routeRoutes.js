const express = require('express');
const routeController = require('../Controllers/routeController');
const router = express.Router();

router.post('/', routeController.createRoute);
router.get('/', routeController.getAllRoutes);
router.get('/:id', routeController.getRouteById);
router.put('/:id', routeController.updateRoute);
router.delete('/:id', routeController.deleteRoute);

module.exports = router;

// // Route to create a new route
// router.post('/api/routes', routeController.createRoute);

// // Route to get all routes
// router.get('/api/routes', routeController.getAllRoutes);

// // Route to get a specific route by ID
// router.get('/api/routes/:id', routeController.getRouteById);

// // Route to update a route by ID
// router.put('/api/routes/:id', routeController.updateRoute);

// // Route to delete a route by ID
// router.delete('/api/routes/:id', routeController.deleteRoute);

// module.exports = router;

