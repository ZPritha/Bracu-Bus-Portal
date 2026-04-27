const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAllRead,
  markOneRead
} = require('../Controllers/notificationController');

router.get('/:studentId', getNotifications);
router.patch('/:studentId/read-all', markAllRead);
router.patch('/:id/read', markOneRead);

module.exports = router;