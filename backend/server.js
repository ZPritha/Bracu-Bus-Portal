const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use('/uploads', express.static('uploads'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Your existing routes
const announcementRoutes = require('./routes/announcementRoutes');
app.use('/api/announcements', announcementRoutes);

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const adminAuthRoutes = require('./routes/adminAuthRoutes');
app.use('/api/admin/auth', adminAuthRoutes);

const lostFoundRoutes = require('./routes/lostFoundRoutes');
app.use('/api/lostfound', lostFoundRoutes);

const notificationRoutes = require('./routes/notificationRoutes');
app.use('/api/notifications',  notificationRoutes);

// Teammate's routes

const feedbackRoutes = require('./routes/feedbackRoutes');
app.use('/api/feedbacks', feedbackRoutes);

const routeRoutes = require('./routes/routeRoutes');
app.use('/api/routes', routeRoutes);

const stoppageRoutes = require('./routes/stoppageRoutes');
app.use('/api/stoppages', stoppageRoutes);

const busRoutes = require('./routes/busRoutes');
app.use('/api/buses', busRoutes);

//ishika-junnabi

const bookingRoutes = require('./routes/bookingRoutes');
app.use('/api/bookings', bookingRoutes);

const planRoutes = require('./routes/planRoutes');
app.use('/api/plans', planRoutes);

const scheduleRoutes = require('./routes/scheduleRoutes');
app.use('/api/schedules', scheduleRoutes);

const studentRoutes = require('./routes/studentRoutes');
app.use('/api/students', studentRoutes);

const fareRoutes = require('./routes/fareRoutes');
app.use('/api/fare', fareRoutes);

const paymentRoutes = require('./routes/paymentRoutes');
app.use('/api/payment', paymentRoutes);

const reportRoutes = require('./routes/reportRoutes');
app.use('/api/reports', reportRoutes);

const sosRoutes = require('./routes/sosRoutes');
app.use('/api/sos', sosRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 9255, () => {
      console.log(`Server running on port ${process.env.PORT || 9255}`);
    });
  })
  .catch(err => console.log(err));