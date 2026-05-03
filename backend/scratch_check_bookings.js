const mongoose = require('mongoose');
const Booking = require('./models/Booking');

async function checkBookings() {
  await mongoose.connect('mongodb+srv://bracubus:bracubus1234@cluster0.xvtkkss.mongodb.net/bracubus');
  const bookings = await Booking.find({ status: 'confirmed' });
  console.log(JSON.stringify(bookings, null, 2));
  await mongoose.disconnect();
}

checkBookings();
