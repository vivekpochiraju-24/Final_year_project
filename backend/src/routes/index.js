const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const doctorRoutes = require('./doctors');
const appointmentRoutes = require('./appointments');
const notificationRoutes = require('./notifications');

router.use('/auth', authRoutes);
router.use('/doctors', doctorRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
