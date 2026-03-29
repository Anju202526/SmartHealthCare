const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor:     { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  date:       { type: String, required: true },
  time:       { type: String, required: true },
  type:       { type: String, enum: ['Video Call','In-Person'], default: 'Video Call' },
  fee:        { type: Number },
  status:     { type: String, enum: ['Upcoming','Completed','Cancelled'], default: 'Upcoming' },
  notes:      { type: String },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Appointment', appointmentSchema);
