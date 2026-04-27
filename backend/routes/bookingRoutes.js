const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Bus = require('../models/Bus');

function parseLocalTimeOnDate(baseDate, timeString) {
  if (!timeString) return null;

  const timeMatch = String(timeString).trim().match(/^(\d{1,2}):(\d{2})(?:\s*([AP]M))?$/i);
  if (!timeMatch) return null;

  let hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);
  const meridiem = timeMatch[3]?.toUpperCase();

  if (meridiem === 'PM' && hours !== 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;

  const date = new Date(baseDate);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function getDepartureDateTime(booking) {
  const baseDate = booking?.travel_date || booking?.createdAt;
  if (!baseDate || !booking?.selected_departure_time) return null;
  return parseLocalTimeOnDate(new Date(baseDate), booking.selected_departure_time);
}

// POST create a booking
router.post('/', async (req, res) => {
  try {
    const planRouteId = req.body.plan_route_id;
    const selectedDepartureTime = req.body.selected_departure_time;
    const travelDate = req.body.travel_date ? new Date(req.body.travel_date) : new Date();

    if (planRouteId && selectedDepartureTime) {
      const bus = await Bus.findOne({ route: planRouteId, is_active: true });
      const capacity = bus?.capacity ?? 40;
      const tripStart = parseLocalTimeOnDate(travelDate, selectedDepartureTime);

      const bookedSeats = await Booking.countDocuments({
        plan_route_id: planRouteId,
        selected_departure_time: selectedDepartureTime,
        status: 'confirmed',
        travel_date: {
          $gte: new Date(travelDate.setHours(0, 0, 0, 0)),
          $lt: new Date(new Date(travelDate).setHours(24, 0, 0, 0))
        }
      });

      if (bookedSeats >= capacity) {
        return res.status(409).json({
          message: `No seats left for this departure. Bus capacity is ${capacity}.`
        });
      }

      if (tripStart && new Date() > tripStart) {
        return res.status(400).json({ message: 'Cannot book a departure time that has already started.' });
      }
    }

    const booking = new Booking({
      travel_date: travelDate,
      user_id: req.body.user_id,
      plan_name: req.body.plan_name,
      plan_fare: req.body.plan_fare,
      plan_stoppage_id: req.body.plan_stoppage_id,
      plan_stoppage_name: req.body.plan_stoppage_name,
      plan_route_id: req.body.plan_route_id,
      plan_route_name: req.body.plan_route_name,
      selected_pickup_time: req.body.selected_pickup_time,
      selected_departure_time: req.body.selected_departure_time,
      payment_method: req.body.payment_method,
      status: req.body.status
    });
    const saved = await booking.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH cancel booking
router.patch('/:booking_id/cancel', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.booking_id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({ message: 'This ticket is already cancelled.' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET booking by ID
router.get('/:booking_id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.booking_id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all bookings for a user
router.get('/user/:user_id', async (req, res) => {
  try {
    const bookings = await Booking.find({ user_id: req.params.user_id });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;