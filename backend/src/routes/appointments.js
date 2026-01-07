const express = require('express');
const router = express.Router();
const { auth, authorizeRoles } = require('../middleware/auth');
const {
  getSlots,
  createAppointment,
  getUserAppointments,
  updateAppointment,
  deleteAppointment
} = require('../controllers/appointmentController');

router.get('/slots', getSlots);
router.post('/', auth, authorizeRoles('patient', 'admin'), createAppointment);
router.get('/', auth, getUserAppointments);
router.put('/:id', auth, updateAppointment);
router.delete('/:id', auth, deleteAppointment);

module.exports = router;