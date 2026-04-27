const Student = require('../models/Student');
const bcrypt = require('bcrypt');

async function register(req, res) {
  try {
    const { studentId, name, email, password, department, semester } = req.body;

    const existing = await Student.findOne({
      $or: [{ studentId }, { email }]
    });
    if (existing) {
      return res.status(400).json({ error: 'Student ID or email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = new Student({
      studentId,
      name,
      email,
      password: hashedPassword,
      department,
      semester,
      subscriptionPlan: 'No Plan'
    });

    await student.save();
    res.status(201).json({
      message: 'Registered successfully',
      studentId: student.studentId,
      name: student.name,
      subscriptionPlan: student.subscriptionPlan
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function login(req, res) {
  try {
    const { studentId, password } = req.body;

    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(404).json({ error: 'Student ID not found.' });
    }

    const match = await bcrypt.compare(password, student.password);
    if (!match) {
      return res.status(401).json({ error: 'Incorrect password.' });
    }

    res.json({
      message: 'Login successful',
      studentId: student.studentId,
      name: student.name,
      email: student.email,
      department: student.department,
      semester: student.semester,
      subscriptionPlan: student.subscriptionPlan
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { register, login };