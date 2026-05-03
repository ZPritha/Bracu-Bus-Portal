const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

router.put('/:studentId/plan', async (req, res) => {
  try {
    const { plan_name, plan_fare, plan_route_id, plan_route_name, plan_stoppage_id, plan_stoppage_name, plan_expires_at } = req.body;
    const student = await Student.findOneAndUpdate(
      { studentId: req.params.studentId },
      { plan_name, plan_fare, plan_route_id, plan_route_name, plan_stoppage_id, plan_stoppage_name, plan_expires_at },
      { new: true }
    );
    if (!student) return res.status(404).json({ error: 'Student not found.' });
    res.json({ message: 'Plan updated', student });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ← new: dismiss an announcement
router.patch('/:studentId/dismiss-announcement', async (req, res) => {
  try {
    const { announcementId } = req.body;
    const student = await Student.findOneAndUpdate(
      { studentId: req.params.studentId },
      { $addToSet: { dismissedAnnouncements: announcementId } },
      { new: true }
    );
    if (!student) return res.status(404).json({ error: 'Student not found.' });
    res.json({ message: 'Announcement dismissed', dismissedAnnouncements: student.dismissedAnnouncements });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ← new: get dismissed announcements
router.get('/:studentId/dismissed-announcements', async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.params.studentId });
    if (!student) return res.status(404).json({ error: 'Student not found.' });
    res.json({ dismissedAnnouncements: student.dismissedAnnouncements });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get student profile
router.get('/:studentId', async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.params.studentId });
    if (!student) return res.status(404).json({ error: 'Student not found.' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;