const express = require('express');
const router = express.Router();
const { auth, authorizeRoles } = require('../middleware/auth');
const {
  createDoctor,
  getDoctors,
  getDoctor,
  updateDoctor,
  addSlot
} = require('../controllers/doctorController');

// public list
router.get('/', getDoctors);
router.get('/:id', getDoctor);

// create / update profile and slots (doctor or admin)
router.post('/', auth, authorizeRoles('doctor', 'admin'), createDoctor);
router.put('/:id', auth, authorizeRoles('doctor', 'admin'), updateDoctor);
router.post('/:id/slots', auth, authorizeRoles('doctor', 'admin'), addSlot);

module.exports = router;
