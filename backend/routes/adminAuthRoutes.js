const express = require('express');
const router = express.Router();
const { registerAdmin, loginAdmin } = require('../Controllers/adminAuthController');

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);

module.exports = router;