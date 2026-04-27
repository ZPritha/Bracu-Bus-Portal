const Notification = require('../models/Notification');

async function getNotifications(req, res) {
  try {
    const { studentId } = req.params;
    const notifications = await Notification.find({ studentId })
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function markAllRead(req, res) {
  try {
    const { studentId } = req.params;
    await Notification.updateMany(
      { studentId, isRead: false },
      { isRead: true }
    );
    res.json({ message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function markOneRead(req, res) {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getNotifications, markAllRead, markOneRead };