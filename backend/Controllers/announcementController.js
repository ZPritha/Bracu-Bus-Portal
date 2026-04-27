const Announcement = require('../models/Announcement');

async function getAnnouncements(req, res) {
  try {
    const announcements = await Announcement.find({ status: 'published' })
      .sort({ createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getDrafts(req, res) {
  try {
    const drafts = await Announcement.find({ status: 'draft' })
      .sort({ createdAt: -1 });
    res.json(drafts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function createAnnouncement(req, res) {
  try {
    const { title, message, category, busNumber, routeName, status } = req.body;
    const newAnnouncement = new Announcement({
      title, message, category, busNumber, routeName,
      status: status || 'published'
    });
    await newAnnouncement.save();
    res.status(201).json(newAnnouncement);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function editAnnouncement(req, res) {
  try {
    const { title, message, category, busNumber, routeName } = req.body;
    const updated = await Announcement.findByIdAndUpdate(
      req.params.id,
      { title, message, category, busNumber, routeName },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function publishDraft(req, res) {
  try {
    const updated = await Announcement.findByIdAndUpdate(
      req.params.id,
      { status: 'published' },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteAnnouncement(req, res) {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getAnnouncements,
  getDrafts,
  createAnnouncement,
  editAnnouncement,
  publishDraft,
  deleteAnnouncement
};