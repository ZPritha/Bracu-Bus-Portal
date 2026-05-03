/*const express = require('express');
const router = express.Router();
const Report = require('../models/Report');

// POST submit a report
router.post('/', async (req, res) => {
  try {
    const { student_id, issue_type, bus, route, description } = req.body;
    const report = new Report({ student_id, issue_type, bus, route, description });
    const saved = await report.save();
    res.status(201).json({ message: 'Report submitted successfully', report: saved });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET reports by student ID
router.get('/student/:studentId', async (req, res) => {
  try {
    const reports = await Report.find({ student_id: req.params.studentId })
      .populate('bus', 'bus_number')
      .populate('route', 'route_name')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all reports (admin use)
router.get('/', async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('bus', 'bus_number')
      .populate('route', 'route_name')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;*/

/*const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const Feedback = require('../models/Feedback');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Setup upload folder
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const valid = allowed.test(path.extname(file.originalname).toLowerCase());
    valid ? cb(null, true) : cb(new Error('Only images allowed'));
  }
});

function normalizeRouteName(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function getSentimentFromRatio(ratio) {
  if (ratio >= 0.7) return 'Mostly Negative';
  if (ratio >= 0.4) return 'Mixed';
  return 'Mostly Positive';
}

// POST - submit report with optional image
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { student_id, issue_type, bus, route, description } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    const report = new Report({ student_id, issue_type, bus, route, description, image_url });
    const saved = await report.save();
    res.status(201).json({ message: 'Report submitted successfully', report: saved });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET reports by student ID
router.get('/student/:studentId', async (req, res) => {
  try {
    const reports = await Report.find({ student_id: req.params.studentId })
      .populate('bus', 'bus_number')
      .populate('route', 'route_name')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET - analytics for credibility ← NEW
router.get('/analytics/credibility', async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('bus', 'bus_number')
      .populate('route', 'route_name')
      .sort({ createdAt: -1 });

    const feedbacks = await Feedback.find();

    const feedbackByRoute = feedbacks.reduce((acc, feedback) => {
      const key = normalizeRouteName(feedback.busRoute);
      if (!acc[key]) {
        acc[key] = { total: 0, negative: 0 };
      }

      acc[key].total += 1;
      if (Number(feedback.rating) <= 2) {
        acc[key].negative += 1;
      }

      return acc;
    }, {});

    const reportCountByRoute = reports.reduce((acc, report) => {
      const routeName = report.route?.route_name || '';
      const key = normalizeRouteName(routeName);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    // Calculate credibility per report
    const reportsWithCredibility = reports.map(report => {
      const routeName = report.route?.route_name;
      const busNumber = report.bus?.bus_number;

      const normalizedRoute = normalizeRouteName(routeName);
      const routeStats = feedbackByRoute[normalizedRoute] || { total: 0, negative: 0 };
      const totalFeedbacks = routeStats.total;
      const negativeFeedbacks = routeStats.negative;
      const credibility = totalFeedbacks > 0
        ? Math.round((negativeFeedbacks / totalFeedbacks) * 100)
        : 0;
      const negativityRatio = totalFeedbacks > 0 ? (negativeFeedbacks / totalFeedbacks) : 0;
      const previousReportsForRoute = Math.max((reportCountByRoute[normalizedRoute] || 0) - 1, 0);

      return {
        _id: report._id,
        issue_type: report.issue_type,
        bus_number: busNumber,
        route_name: routeName,
        description: report.description,
        status: report.status,
        createdAt: report.createdAt,
        image_url: report.image_url,
        credibility,
        totalFeedbacks,
        negativeFeedbacks,
        sentiment: getSentimentFromRatio(negativityRatio),
        previousReportsForRoute
      };
    });

    // Bus-wise credibility summary
    const busStats = {};
    reportsWithCredibility.forEach(r => {
      if (!r.bus_number) return;
      if (!busStats[r.bus_number]) {
        busStats[r.bus_number] = { reports: 0, total: 0, avgCredibility: 0 };
      }
      busStats[r.bus_number].reports++;
      busStats[r.bus_number].total += r.credibility;
      busStats[r.bus_number].avgCredibility = Math.round(
        busStats[r.bus_number].total / busStats[r.bus_number].reports
      );
    });

    // Status summary
    const statusSummary = {
      pending:  reports.filter(r => r.status === 'pending').length,
      reviewed: reports.filter(r => r.status === 'reviewed').length,
      resolved: reports.filter(r => r.status === 'resolved').length,
    };

    res.json({
      reports: reportsWithCredibility,
      busStats,
      statusSummary,
      totalReports: reports.length,
      totalFeedbacks: feedbacks.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all reports
router.get('/', async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('bus', 'bus_number')
      .populate('route', 'route_name')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH update status
router.patch('/:id', async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(report);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router; */

const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const Feedback = require('../models/Feedback');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Setup upload folder
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const valid = allowed.test(path.extname(file.originalname).toLowerCase());
    valid ? cb(null, true) : cb(new Error('Only images allowed'));
  }
});

function normalizeRouteName(value) {
  return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function getSentimentFromRatio(ratio) {
  if (ratio >= 0.7) return 'Mostly Negative';
  if (ratio >= 0.4) return 'Mixed';
  return 'Mostly Positive';
}

// POST - submit report with optional image
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { student_id, issue_type, bus, route, description } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    const report = new Report({ student_id, issue_type, bus, route, description, image_url });
    const saved = await report.save();
    res.status(201).json({ message: 'Report submitted successfully', report: saved });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET reports by student ID
router.get('/student/:studentId', async (req, res) => {
  try {
    const reports = await Report.find({ student_id: req.params.studentId })
      .populate('bus', 'bus_number')
      .populate('route', 'route_name')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET - analytics for credibility
router.get('/analytics/credibility', async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('bus', 'bus_number')
      .populate('route', 'route_name')
      .sort({ createdAt: -1 });

    const feedbacks = await Feedback.find();

    const feedbackByRoute = feedbacks.reduce((acc, feedback) => {
      const key = normalizeRouteName(feedback.busRoute);
      if (!acc[key]) acc[key] = { total: 0, negative: 0 };
      acc[key].total += 1;
      if (Number(feedback.rating) <= 2) acc[key].negative += 1;
      return acc;
    }, {});

    const reportCountByRoute = reports.reduce((acc, report) => {
      const routeName = report.route?.route_name || '';
      const key = normalizeRouteName(routeName);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const reportsWithCredibility = reports.map(report => {
      const routeName = report.route?.route_name;
      const busNumber = report.bus?.bus_number;
      const normalizedRoute = normalizeRouteName(routeName);
      const routeStats = feedbackByRoute[normalizedRoute] || { total: 0, negative: 0 };
      const totalFeedbacks = routeStats.total;
      const negativeFeedbacks = routeStats.negative;
      const credibility = totalFeedbacks > 0 ? Math.round((negativeFeedbacks / totalFeedbacks) * 100) : 0;
      const negativityRatio = totalFeedbacks > 0 ? (negativeFeedbacks / totalFeedbacks) : 0;
      const previousReportsForRoute = Math.max((reportCountByRoute[normalizedRoute] || 0) - 1, 0);
      return {
        _id: report._id,
        issue_type: report.issue_type,
        bus_number: busNumber,
        route_name: routeName,
        description: report.description,
        status: report.status,
        createdAt: report.createdAt,
        image_url: report.image_url,
        credibility,
        totalFeedbacks,
        negativeFeedbacks,
        sentiment: getSentimentFromRatio(negativityRatio),
        previousReportsForRoute
      };
    });

    const busStats = {};
    reportsWithCredibility.forEach(r => {
      if (!r.bus_number) return;
      if (!busStats[r.bus_number]) busStats[r.bus_number] = { reports: 0, total: 0, avgCredibility: 0 };
      busStats[r.bus_number].reports++;
      busStats[r.bus_number].total += r.credibility;
      busStats[r.bus_number].avgCredibility = Math.round(busStats[r.bus_number].total / busStats[r.bus_number].reports);
    });

    const statusSummary = {
      pending:  reports.filter(r => r.status === 'pending').length,
      reviewed: reports.filter(r => r.status === 'reviewed').length,
      resolved: reports.filter(r => r.status === 'resolved').length,
    };

    res.json({
      reports: reportsWithCredibility,
      busStats,
      statusSummary,
      totalReports: reports.length,
      totalFeedbacks: feedbacks.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all reports (admin)
router.get('/', async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('bus', 'bus_number')
      .populate('route', 'route_name')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH - update status (pending → accepted / reviewed / resolved)
router.patch('/:id', async (req, res) => {
  try {
    const allowedStatuses = ['pending', 'reviewed', 'resolved', 'accepted'];
    if (!allowedStatuses.includes(req.body.status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json(report);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE - decline/remove a report
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Report.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Report not found' });

    // Also delete the image file if it exists
    if (deleted.image_url) {
      const filePath = path.join(__dirname, '..', deleted.image_url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    res.json({ message: 'Report declined and removed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;