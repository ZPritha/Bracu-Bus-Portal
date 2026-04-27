const express = require('express');
const router = express.Router();
const {
  getAnnouncements,
  getDrafts,
  createAnnouncement,
  editAnnouncement,
  publishDraft,
  deleteAnnouncement
} = require('../Controllers/announcementController');

router.get('/', getAnnouncements);
router.get('/drafts', getDrafts);
router.post('/', createAnnouncement);
router.put('/:id', editAnnouncement);
router.patch('/:id/publish', publishDraft);
router.delete('/:id', deleteAnnouncement);

module.exports = router;