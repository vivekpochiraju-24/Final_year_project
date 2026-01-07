const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    start: { type: String, required: true }, // HH:mm
    end: { type: String, required: true },
    status: { type: String, enum: ['booked', 'cancelled', 'completed', 'rescheduled'], default: 'booked' },
    notes: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
