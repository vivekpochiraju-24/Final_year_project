const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  date: { type: String, required: true }, // YYYY-MM-DD
  start: { type: String, required: true }, // HH:mm
  end: { type: String, required: true },
  available: { type: Boolean, default: true }
});

const doctorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    specialization: { type: String },
    slots: [slotSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);
