require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { connectDB } = require('../config/db');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

async function seed() {
  await connectDB();
  await User.deleteMany({});
  await Doctor.deleteMany({});

  const pass = await bcrypt.hash('password123', 10);

  const patient = await User.create({ name: 'John Patient', email: 'patient@example.com', password: pass, role: 'patient' });
  const doctorUser = await User.create({ name: 'Dr. Alice', email: 'doctor@example.com', password: pass, role: 'doctor' });

  const doc = await Doctor.create({
    user: doctorUser._id,
    specialization: 'General Physician',
    slots: [
      { date: '2026-01-10', start: '09:00', end: '09:30', available: true },
      { date: '2026-01-10', start: '09:30', end: '10:00', available: true }
    ]
  });

  console.log('Seed complete');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});