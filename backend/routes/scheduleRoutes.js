const express = require('express');
const router = express.Router();
const scheduleController = require('../Controllers/scheduleController');

router.get('/', scheduleController.getSchedules);         // GET with optional ?route_id=&stoppage_id=
router.get('/all', scheduleController.getAllSchedules);   // GET all schedules
router.post('/', scheduleController.createSchedule);      // POST create
router.get('/:stoppage_id', scheduleController.getScheduleByStoppage); // GET by stoppage_id
router.put('/:id', scheduleController.updateSchedule);    // PUT update
router.delete('/:id', scheduleController.deleteSchedule); // DELETE

module.exports = router;