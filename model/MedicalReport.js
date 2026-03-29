const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  patient:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor:      { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', default: null },
  title:       { type: String, required: true },
  report_type: { type: String, default: 'General' },
  file_url:    { type: String, default: null },
  file_size:   { type: String, default: null },
  uploaded_at: { type: Date,   default: Date.now }
});

module.exports = mongoose.model('MedicalReport', reportSchema);
