const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');  // ← add this
const { submitFeedback, getFeedbacks } = require('../Controllers/feedbackController');

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/')),  // ← fix path
  filename:    (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.post('/',  upload.single('attachment'), submitFeedback);
router.get('/',   getFeedbacks);

module.exports = router;