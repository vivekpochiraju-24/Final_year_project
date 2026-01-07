const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Notification = require('../models/Notification');

async function getSlots(req, res) {
  const { doctorId, date } = req.query;
  if (!doctorId || !date) return res.status(400).json({ message: 'doctorId and date are required' });
  const doctor = await Doctor.findById(doctorId).populate('user', 'name email');
  if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
  const slots = doctor.slots.filter((s) => s.date === date && s.available);
  res.json({ doctor: { id: doctor._id, name: doctor.user.name, email: doctor.user.email }, slots });
}

async function createAppointment(req, res) {
  const { doctorId, date, start, end, notes } = req.body;
  if (!doctorId || !date || !start || !end) return res.status(400).json({ message: 'Missing fields' });

  // find doctor and slot
  const doctor = await Doctor.findById(doctorId).populate('user', 'name email');
  if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

  const slotIndex = doctor.slots.findIndex((s) => s.date === date && s.start === start && s.end === end);
  if (slotIndex === -1) return res.status(400).json({ message: 'Slot not found' });
  if (!doctor.slots[slotIndex].available) return res.status(400).json({ message: 'Slot not available' });

  // double-booking safety: check existing appointments
  const exists = await Appointment.findOne({ doctor: doctorId, date, start, status: 'booked' });
  if (exists) return res.status(400).json({ message: 'Slot already booked' });

  // mark slot unavailable
  doctor.slots[slotIndex].available = false;
  await doctor.save();

  const appointment = await Appointment.create({
    patient: req.user._id,
    doctor: doctorId,
    date,
    start,
    end,
    notes
  });

  // create notifications for doctor and patient
  const doctorNotif = await Notification.create({
    user: doctor.user,
    type: 'appointment',
    message: `New appointment booked on ${date} ${start} by ${req.user.name || req.user.email}`
  });
  const patientNotif = await Notification.create({
    user: req.user._id,
    type: 'appointment',
    message: `Appointment confirmed with Dr. ${doctor.user.name} on ${date} ${start}`
  });

  // emit real-time events
  const io = req.app.get('io');
  if (io) {
    io.to(`doctor_${doctorId}`).emit('appointment_booked', appointment);
    io.to(`user_${req.user._id}`).emit('appointment_booked', appointment);
    io.to(`doctor_${doctorId}`).emit('slot_updated', { doctorId, slots: doctor.slots });
    // emit notifications
    io.to(`user_${doctor.user}`).emit('notification', doctorNotif);
    io.to(`user_${req.user._id}`).emit('notification', patientNotif);
  }

  res.status(201).json(appointment);
}

async function getUserAppointments(req, res) {
  const user = req.user;
  if (user.role === 'patient') {
    const appts = await Appointment.find({ patient: user._id }).populate('doctor');
    return res.json(appts);
  }
  if (user.role === 'doctor') {
    // find doctor's record
    const doc = await Doctor.findOne({ user: user._id });
    if (!doc) return res.status(404).json({ message: 'Doctor profile not found' });
    const appts = await Appointment.find({ doctor: doc._id }).populate('patient', 'name email');
    return res.json(appts);
  }
  // admin
  const appts = await Appointment.find({}).populate('patient doctor');
  res.json(appts);
}

async function updateAppointment(req, res) {
  const { id } = req.params;
  const { date, start, end, status } = req.body;
  const appt = await Appointment.findById(id);
  if (!appt) return res.status(404).json({ message: 'Appointment not found' });

  // only patient who booked, doctor of appt, or admin can change
  const user = req.user;
  if (
    user.role !== 'admin' &&
    !(user.role === 'patient' && appt.patient.toString() === user._id.toString()) &&
    !(user.role === 'doctor' && appt.doctor.toString() === user._id.toString())
  ) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const doctor = await Doctor.findById(appt.doctor);
  if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

  // if rescheduling
  if (date && start && end) {
    // free old slot
    const oldSlotIndex = doctor.slots.findIndex((s) => s.date === appt.date && s.start === appt.start && s.end === appt.end);
    if (oldSlotIndex !== -1) {
      doctor.slots[oldSlotIndex].available = true;
    }

    // check new slot
    const newIndex = doctor.slots.findIndex((s) => s.date === date && s.start === start && s.end === end);
    if (newIndex === -1) return res.status(400).json({ message: 'New slot not found' });
    if (!doctor.slots[newIndex].available) return res.status(400).json({ message: 'New slot not available' });

    doctor.slots[newIndex].available = false;

    appt.date = date;
    appt.start = start;
    appt.end = end;
    appt.status = status || appt.status;

    await doctor.save();
    await appt.save();

    // create notifications
    const patientNotif = await Notification.create({
      user: appt.patient,
      type: 'appointment',
      message: `Your appointment has been rescheduled to ${date} ${start}`
    });
    const doctorNotif = await Notification.create({
      user: doctor.user,
      type: 'appointment',
      message: `An appointment has been rescheduled to ${date} ${start}`
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`doctor_${appt.doctor}`).emit('appointment_updated', appt);
      io.to(`user_${appt.patient}`).emit('appointment_updated', appt);
      io.to(`doctor_${appt.doctor}`).emit('slot_updated', { doctorId: appt.doctor, slots: doctor.slots });
      io.to(`user_${appt.patient}`).emit('notification', patientNotif);
      io.to(`user_${doctor.user}`).emit('notification', doctorNotif);
    }

    return res.json(appt);
  }

  // if only updating status
  if (status) {
    appt.status = status;
    await appt.save();
    const io = req.app.get('io');
    if (io) {
      io.to(`doctor_${appt.doctor}`).emit('appointment_updated', appt);
      io.to(`user_${appt.patient}`).emit('appointment_updated', appt);
    }
    return res.json(appt);
  }

  res.json(appt);
}

async function deleteAppointment(req, res) {
  const { id } = req.params;
  const appt = await Appointment.findById(id);
  if (!appt) return res.status(404).json({ message: 'Appointment not found' });
  const user = req.user;
  if (
    user.role !== 'admin' &&
    !(user.role === 'patient' && appt.patient.toString() === user._id.toString()) &&
    !(user.role === 'doctor' && appt.doctor.toString() === user._id.toString())
  ) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  // mark cancelled and free slot
  appt.status = 'cancelled';
  await appt.save();

  const doctor = await Doctor.findById(appt.doctor).populate('user', 'name email');
  if (doctor) {
    const slotIndex = doctor.slots.findIndex((s) => s.date === appt.date && s.start === appt.start && s.end === appt.end);
    if (slotIndex !== -1) {
      doctor.slots[slotIndex].available = true;
      await doctor.save();
    }
  }

  // create notifications
  const patientNotif = await Notification.create({
    user: appt.patient,
    type: 'appointment',
    message: `Your appointment on ${appt.date} ${appt.start} was cancelled`
  });
  const doctorNotif = await Notification.create({
    user: doctor.user,
    type: 'appointment',
    message: `An appointment on ${appt.date} ${appt.start} was cancelled`
  });

  const io = req.app.get('io');
  if (io) {
    io.to(`doctor_${appt.doctor}`).emit('appointment_cancelled', appt);
    io.to(`user_${appt.patient}`).emit('appointment_cancelled', appt);
    if (doctor) io.to(`doctor_${appt.doctor}`).emit('slot_updated', { doctorId: appt.doctor, slots: doctor.slots });
    io.to(`user_${appt.patient}`).emit('notification', patientNotif);
    io.to(`user_${doctor.user}`).emit('notification', doctorNotif);
  }

  res.json({ message: 'Appointment cancelled', appt });
}

module.exports = { getSlots, createAppointment, getUserAppointments, updateAppointment, deleteAppointment };
