const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');
require('dotenv').config({ path: './.env' });

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);

  const hashed = await bcrypt.hash('admin123', 10);
  const admin = new Admin({
    adminId: 'admin01',
    name: 'Super Admin',
    email: 'admin@bracu.ac.bd',
    password: hashed,
    role: 'admin'
  });

  await admin.save();
  console.log('Admin created successfully!');
  console.log('ID: admin01 | Password: admin123');
  mongoose.disconnect();
}

createAdmin().catch(console.error); 