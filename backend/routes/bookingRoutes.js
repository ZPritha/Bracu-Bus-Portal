

/*const express = require('express');
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

// POST create a booking
router.post('/', async (req, res) => {
  try {
    const planRouteId = req.body.plan_route_id;
    const selectedPickupTime = req.body.selected_pickup_time;
    const selectedDepartureTime = req.body.selected_departure_time;

    // Fix: clone travelDate before any mutation so both bounds stay correct
    const travelDate = req.body.travel_date ? new Date(req.body.travel_date) : new Date();
    const dayStart = new Date(travelDate); dayStart.setHours(0, 0, 0, 0);
    const dayEnd   = new Date(travelDate); dayEnd.setHours(23, 59, 59, 999);

    if (planRouteId) {
      // Get the bus for this route to read its real seat count
      const bus = await Bus.findOne({ route: planRouteId, is_active: true });

      // Use bus.seats from schema (default 5). Fall back to 8 if bus not found.
      const capacity = bus?.seats ?? 8;

      const userId = req.body.user_id;

      // --- Pickup slot checks ---
      if (selectedPickupTime) {
        const basePickupFilter = {
          plan_route_id: planRouteId,
          selected_pickup_time: selectedPickupTime,
          status: 'confirmed',
          travel_date: { $gte: dayStart, $lte: dayEnd }
        };

        // 1. Duplicate check: this user already booked this pickup slot today
        const alreadyBookedPickup = await Booking.findOne({
          ...basePickupFilter,
          user_id: userId
        });
        if (alreadyBookedPickup) {
          return res.status(409).json({
            message: `You already have a booking for the ${selectedPickupTime} pickup slot on this route today.`
          });
        }

        // 2. Capacity check: count distinct students who booked this slot
        const uniquePickupStudents = await Booking.distinct('user_id', basePickupFilter);
        if (uniquePickupStudents.length >= capacity) {
          return res.status(409).json({
            message: `Seat full for the ${selectedPickupTime} pickup slot on this route. All ${capacity} seats are taken.`
          });
        }
      }

      // --- Departure slot checks ---
      if (selectedDepartureTime) {
        const baseDepartureFilter = {
          plan_route_id: planRouteId,
          selected_departure_time: selectedDepartureTime,
          status: 'confirmed',
          travel_date: { $gte: dayStart, $lte: dayEnd }
        };

        // 1. Duplicate check: this user already booked this departure slot today
        const alreadyBookedDeparture = await Booking.findOne({
          ...baseDepartureFilter,
          user_id: userId
        });
        if (alreadyBookedDeparture) {
          return res.status(409).json({
            message: `You already have a booking for the ${selectedDepartureTime} departure slot on this route today.`
          });
        }

        // 2. Capacity check: count distinct students who booked this slot
        const uniqueDepartureStudents = await Booking.distinct('user_id', baseDepartureFilter);
        if (uniqueDepartureStudents.length >= capacity) {
          return res.status(409).json({
            message: `Seat full for the ${selectedDepartureTime} departure slot on this route. All ${capacity} seats are taken.`
          });
        }

        // 3. Prevent booking a departure that has already passed
        const tripStart = parseLocalTimeOnDate(travelDate, selectedDepartureTime);
        if (tripStart && new Date() > tripStart) {
          return res.status(400).json({ message: 'Cannot book a departure time that has already started.' });
        }
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
      selected_pickup_time: selectedPickupTime,
      selected_departure_time: selectedDepartureTime,
      payment_method: req.body.payment_method,
      payment_status: req.body.payment_method === 'cash' ? 'pending' : 'paid',
      arrival_status: 'not arrived',
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

// GET all bookings (admin)
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH update payment status (admin)
router.patch('/:booking_id/payment-status', async (req, res) => {
  try {
    const { payment_status } = req.body;
    if (!['pending', 'paid'].includes(payment_status)) {
      return res.status(400).json({ message: 'Invalid payment_status value.' });
    }
    const booking = await Booking.findByIdAndUpdate(
      req.params.booking_id,
      { payment_status },
      { new: true }
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH update arrival status (admin or student scan)
router.patch('/:booking_id/arrival-status', async (req, res) => {
  try {
    const { arrival_status } = req.body;
    if (!['arrived', 'not arrived'].includes(arrival_status)) {
      return res.status(400).json({ message: 'Invalid arrival_status value.' });
    }
    const booking = await Booking.findByIdAndUpdate(
      req.params.booking_id,
      { arrival_status },
      { new: true }
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH update arrival status (by route name and student ID)
router.patch('/update-status-by-route', async (req, res) => {
  try {
    const { studentId, routeName, arrival_status } = req.body;
    console.log(`QR Scan Request: Student=${studentId}, Route="${routeName}", Status=${arrival_status}`);

    if (!studentId || !routeName || !arrival_status) {
      return res.status(400).json({ message: 'Missing required fields: studentId, routeName, arrival_status' });
    }

    const result = await Booking.updateMany(
      {
        user_id: studentId,
        plan_route_name: { $regex: new RegExp(routeName, 'i') },
        status: 'confirmed'
      },
      { arrival_status }
    );

    console.log(`Update Result: Matched=${result.matchedCount}, Modified=${result.modifiedCount}`);
    res.json({ message: 'Status updated', matchedCount: result.matchedCount, modifiedCount: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;*/
const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Bus = require('../models/Bus');
const Waitlist = require('../models/Waitlist');
const Notification = require('../models/Notification'); // assumed to exist already

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

// ─── Helper: promote first waitlist entry for a freed slot ─────────────────
async function promoteFromWaitlist({ planRouteId, slotType, slotTime, travelDate }) {
  try {
    const dayStart = new Date(travelDate); dayStart.setHours(0, 0, 0, 0);
    const dayEnd   = new Date(travelDate); dayEnd.setHours(23, 59, 59, 999);

    // Match on slot type and time
    const slotField = slotType === 'pickup' ? 'selected_pickup_time' : 'selected_departure_time';
    const entry = await Waitlist.findOne({
      plan_route_id: planRouteId,
      [slotField]: slotTime,
      slot_type: { $in: [slotType, 'both'] },
      status: 'waiting',
      travel_date: { $gte: dayStart, $lte: dayEnd }
    }).sort({ createdAt: 1 }); // FIFO

    if (!entry) return; // nobody waiting

    // Create a real booking for the promoted student
    const newBooking = new Booking({
      travel_date: entry.travel_date,
      user_id: entry.user_id,
      plan_name: entry.plan_name,
      plan_fare: entry.plan_fare,
      plan_stoppage_id: entry.plan_stoppage_id,
      plan_stoppage_name: entry.plan_stoppage_name,
      plan_route_id: entry.plan_route_id,
      plan_route_name: entry.plan_route_name,
      selected_pickup_time: entry.selected_pickup_time,
      selected_departure_time: entry.selected_departure_time,
      payment_method: entry.payment_method,
      payment_status: entry.payment_method === 'cash' ? 'pending' : 'paid',
      arrival_status: 'not arrived',
      status: 'confirmed'
    });
    await newBooking.save();

    // Mark waitlist entry as promoted
    entry.status = 'promoted';
    entry.promoted_booking_id = newBooking._id;
    await entry.save();

    // Send notification (if Notification model exists)
    try {
      await Notification.create({
        studentId: entry.user_id,
        message: `🎉 Good news! A seat opened up on ${entry.plan_route_name} for the ${slotTime} slot. Your waitlist request has been confirmed — you're booked!`,
        isRead: false
      });
    } catch (_) { /* notifications optional */ }

    console.log(`[Waitlist] Promoted ${entry.user_id} from waitlist → booking ${newBooking._id}`);
  } catch (err) {
    console.error('[Waitlist] promoteFromWaitlist error:', err.message);
  }
}

// ─── POST /api/bookings — create booking or join waitlist ──────────────────
router.post('/', async (req, res) => {
  try {
    const planRouteId          = req.body.plan_route_id;
    const selectedPickupTime   = req.body.selected_pickup_time;
    const selectedDepartureTime = req.body.selected_departure_time;
    const userId               = req.body.user_id;

    const travelDate = req.body.travel_date ? new Date(req.body.travel_date) : new Date();
    const dayStart   = new Date(travelDate); dayStart.setHours(0, 0, 0, 0);
    const dayEnd     = new Date(travelDate); dayEnd.setHours(23, 59, 59, 999);

    let pickupFull    = false;
    let departureFull = false;

    if (planRouteId) {
      const bus      = await Bus.findOne({ route: planRouteId, is_active: true });
      const capacity = bus?.seats ?? 8;

      // ── Pickup checks ──────────────────────────────────────────────────────
      if (selectedPickupTime) {
        const baseFilter = {
          plan_route_id: planRouteId,
          selected_pickup_time: selectedPickupTime,
          status: 'confirmed',
          travel_date: { $gte: dayStart, $lte: dayEnd }
        };
        const alreadyBooked = await Booking.findOne({ ...baseFilter, user_id: userId });
        if (alreadyBooked) {
          return res.status(409).json({
            message: `You already have a booking for the ${selectedPickupTime} pickup slot on this route today.`
          });
        }
        const uniqueStudents = await Booking.distinct('user_id', baseFilter);
        if (uniqueStudents.length >= capacity) pickupFull = true;
      }

      // ── Departure checks ────────────────────────────────────────────────────
      if (selectedDepartureTime) {
        const baseFilter = {
          plan_route_id: planRouteId,
          selected_departure_time: selectedDepartureTime,
          status: 'confirmed',
          travel_date: { $gte: dayStart, $lte: dayEnd }
        };
        const alreadyBooked = await Booking.findOne({ ...baseFilter, user_id: userId });
        if (alreadyBooked) {
          return res.status(409).json({
            message: `You already have a booking for the ${selectedDepartureTime} departure slot on this route today.`
          });
        }
        const uniqueStudents = await Booking.distinct('user_id', baseFilter);
        if (uniqueStudents.length >= capacity) departureFull = true;

        const tripStart = parseLocalTimeOnDate(travelDate, selectedDepartureTime);
        if (tripStart && new Date() > tripStart) {
          return res.status(400).json({ message: 'Cannot book a departure time that has already started.' });
        }
      }
    }

    // ── Both slots full → waitlist ─────────────────────────────────────────
    if (pickupFull && departureFull) {
      // Check if already on waitlist
      const alreadyWaiting = await Waitlist.findOne({
        user_id: userId,
        plan_route_id: planRouteId,
        status: 'waiting'
      });
      if (alreadyWaiting) {
        return res.status(409).json({ message: 'You are already on the waitlist for this route.' });
      }
      const entry = await Waitlist.create({
        user_id: userId,
        plan_name: req.body.plan_name,
        plan_fare: req.body.plan_fare,
        plan_stoppage_id: req.body.plan_stoppage_id,
        plan_stoppage_name: req.body.plan_stoppage_name,
        plan_route_id: planRouteId,
        plan_route_name: req.body.plan_route_name,
        selected_pickup_time: selectedPickupTime,
        selected_departure_time: selectedDepartureTime,
        payment_method: req.body.payment_method,
        travel_date: req.body.travel_date ? new Date(req.body.travel_date) : new Date(),
        slot_type: 'both'
      });
      return res.status(202).json({ waitlisted: true, waitlist: entry, message: 'Bus is full. You have been added to the waitlist. We will notify you if a seat opens up.' });
    }

    // ── Only pickup full → waitlist for pickup ─────────────────────────────
    if (pickupFull) {
      const alreadyWaiting = await Waitlist.findOne({
        user_id: userId,
        plan_route_id: planRouteId,
        selected_pickup_time: selectedPickupTime,
        slot_type: 'pickup',
        status: 'waiting'
      });
      if (alreadyWaiting) {
        return res.status(409).json({ message: 'You are already on the waitlist for this pickup slot.' });
      }
      const entry = await Waitlist.create({
        user_id: userId,
        plan_name: req.body.plan_name,
        plan_fare: req.body.plan_fare,
        plan_stoppage_id: req.body.plan_stoppage_id,
        plan_stoppage_name: req.body.plan_stoppage_name,
        plan_route_id: planRouteId,
        plan_route_name: req.body.plan_route_name,
        selected_pickup_time: selectedPickupTime,
        selected_departure_time: selectedDepartureTime,
        payment_method: req.body.payment_method,
        travel_date: req.body.travel_date ? new Date(req.body.travel_date) : new Date(),
        slot_type: 'pickup'
      });
      return res.status(202).json({ waitlisted: true, waitlist: entry, message: `Pickup slot is full. Added to waitlist.` });
    }

    // ── Only departure full → waitlist for departure ────────────────────────
    if (departureFull) {
      const alreadyWaiting = await Waitlist.findOne({
        user_id: userId,
        plan_route_id: planRouteId,
        selected_departure_time: selectedDepartureTime,
        slot_type: 'departure',
        status: 'waiting'
      });
      if (alreadyWaiting) {
        return res.status(409).json({ message: 'You are already on the waitlist for this departure slot.' });
      }
      const entry = await Waitlist.create({
        user_id: userId,
        plan_name: req.body.plan_name,
        plan_fare: req.body.plan_fare,
        plan_stoppage_id: req.body.plan_stoppage_id,
        plan_stoppage_name: req.body.plan_stoppage_name,
        plan_route_id: planRouteId,
        plan_route_name: req.body.plan_route_name,
        selected_pickup_time: selectedPickupTime,
        selected_departure_time: selectedDepartureTime,
        payment_method: req.body.payment_method,
        travel_date: req.body.travel_date ? new Date(req.body.travel_date) : new Date(),
        slot_type: 'departure'
      });
      return res.status(202).json({ waitlisted: true, waitlist: entry, message: `Departure slot is full. Added to waitlist.` });
    }

    // ── Normal booking ─────────────────────────────────────────────────────
    const booking = new Booking({
      travel_date: req.body.travel_date ? new Date(req.body.travel_date) : new Date(),
      user_id: userId,
      plan_name: req.body.plan_name,
      plan_fare: req.body.plan_fare,
      plan_stoppage_id: req.body.plan_stoppage_id,
      plan_stoppage_name: req.body.plan_stoppage_name,
      plan_route_id: planRouteId,
      plan_route_name: req.body.plan_route_name,
      selected_pickup_time: selectedPickupTime,
      selected_departure_time: selectedDepartureTime,
      payment_method: req.body.payment_method,
      payment_status: req.body.payment_method === 'cash' ? 'pending' : 'paid',
      arrival_status: 'not arrived',
      status: req.body.status
    });

    const saved = await booking.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ─── PATCH /:booking_id/cancel — cancel + auto-promote waitlist ────────────
router.patch('/:booking_id/cancel', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.booking_id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status !== 'confirmed') {
      return res.status(400).json({ message: 'This ticket is already cancelled.' });
    }

    booking.status = 'cancelled';
    await booking.save();

    // Auto-promote first person on waitlist for each freed slot
    const travelDate = booking.travel_date || booking.createdAt;
    if (booking.selected_pickup_time) {
      await promoteFromWaitlist({
        planRouteId: booking.plan_route_id,
        slotType: 'pickup',
        slotTime: booking.selected_pickup_time,
        travelDate
      });
    }
    if (booking.selected_departure_time) {
      await promoteFromWaitlist({
        planRouteId: booking.plan_route_id,
        slotType: 'departure',
        slotTime: booking.selected_departure_time,
        travelDate
      });
    }

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ─── GET /waitlist/user/:user_id — get student's waitlist entries ──────────
router.get('/waitlist/user/:user_id', async (req, res) => {
  try {
    const entries = await Waitlist.find({ user_id: req.params.user_id }).sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── DELETE /waitlist/:waitlist_id — leave waitlist ────────────────────────
router.delete('/waitlist/:waitlist_id', async (req, res) => {
  try {
    const entry = await Waitlist.findById(req.params.waitlist_id);
    if (!entry) return res.status(404).json({ message: 'Waitlist entry not found' });
    if (entry.status !== 'waiting') {
      return res.status(400).json({ message: 'Cannot remove — entry is already ' + entry.status });
    }
    await entry.deleteOne();
    res.json({ message: 'Removed from waitlist' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET /:booking_id ──────────────────────────────────────────────────────
router.get('/:booking_id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.booking_id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET /user/:user_id ────────────────────────────────────────────────────
router.get('/user/:user_id', async (req, res) => {
  try {
    const bookings = await Booking.find({ user_id: req.params.user_id });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET / (admin) ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── PATCH /:booking_id/payment-status ────────────────────────────────────
router.patch('/:booking_id/payment-status', async (req, res) => {
  try {
    const { payment_status } = req.body;
    if (!['pending', 'paid'].includes(payment_status)) {
      return res.status(400).json({ message: 'Invalid payment_status value.' });
    }
    const booking = await Booking.findByIdAndUpdate(
      req.params.booking_id,
      { payment_status },
      { new: true }
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── PATCH /:booking_id/arrival-status ────────────────────────────────────
router.patch('/:booking_id/arrival-status', async (req, res) => {
  try {
    const { arrival_status } = req.body;
    if (!['arrived', 'not arrived'].includes(arrival_status)) {
      return res.status(400).json({ message: 'Invalid arrival_status value.' });
    }
    const booking = await Booking.findByIdAndUpdate(
      req.params.booking_id,
      { arrival_status },
      { new: true }
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── PATCH /update-status-by-route (QR scan) ──────────────────────────────
router.patch('/update-status-by-route', async (req, res) => {
  try {
    const { studentId, routeName, arrival_status } = req.body;
    if (!studentId || !routeName || !arrival_status) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const result = await Booking.updateMany(
      {
        user_id: studentId,
        plan_route_name: { $regex: new RegExp(routeName, 'i') },
        status: 'confirmed'
      },
      { arrival_status }
    );
    res.json({ message: 'Status updated', matchedCount: result.matchedCount, modifiedCount: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;