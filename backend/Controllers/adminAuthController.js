const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');

async function registerAdmin(req, res) {
  try {
    const { adminId, name, email, password, role } = req.body;

    const existing = await Admin.findOne({ adminId });
    if (existing) {
      return res.status(400).json({ error: 'Admin ID already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new Admin({
      adminId,
      name,
      email: email || '',
      password: hashedPassword,
      role: role || 'admin'
    });
    await admin.save();

    res.status(201).json({
      message: 'Admin registered successfully',
      adminId: admin.adminId,
      name: admin.name,
      email: admin.email,
      role: admin.role
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function loginAdmin(req, res) {
  try {
    const { adminId, password } = req.body;

    const admin = await Admin.findOne({ adminId });
    if (!admin) {
      return res.status(404).json({ error: 'Admin ID not found.' });
    }

    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res.status(401).json({ error: 'Incorrect password.' });
    }

    res.json({
      message: 'Login successful',
      adminId: admin.adminId,
      name: admin.name,
      email: admin.email,
      role: admin.role
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { registerAdmin, loginAdmin };