const Doctor = require('../models/Doctor');
const User = require('../models/User');

async function createDoctor(req, res) {
  const { specialization } = req.body;
  const userId = req.user._id;
  const exists = await Doctor.findOne({ user: userId });
  if (exists) return res.status(400).json({ message: 'Doctor profile already exists' });

  const doctor = await Doctor.create({ user: userId, specialization, slots: [] });
  res.status(201).json(doctor);
}

async function getDoctors(req, res) {
  const { specialization } = req.query;
  const filter = {};
  if (specialization) filter.specialization = specialization;
  const doctors = await Doctor.find(filter).populate('user', 'name email');
  res.json(doctors);
}

async function getDoctor(req, res) {
  const { id } = req.params;
  const doctor = await Doctor.findById(id).populate('user', 'name email');
  if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
  res.json(doctor);
}

async function updateDoctor(req, res) {
  const { id } = req.params;
  const updates = req.body;
  const doctor = await Doctor.findById(id);
  if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
  // only owner or admin can update
  if (doctor.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  Object.assign(doctor, updates);
  await doctor.save();
  res.json(doctor);
}

async function addSlot(req, res) {
  const { id } = req.params; // doctor id
  const { date, start, end } = req.body;
  const doctor = await Doctor.findById(id);
  if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
  if (doctor.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  doctor.slots.push({ date, start, end, available: true });
  await doctor.save();

  // emit slot_updated event
  const io = req.app.get('io');
  if (io) io.to(`doctor_${id}`).emit('slot_updated', { doctorId: id, slots: doctor.slots });

  res.status(201).json(doctor.slots);
}

module.exports = {
  createDoctor,
  getDoctors,
  getDoctor,
  updateDoctor,
  addSlot
};
