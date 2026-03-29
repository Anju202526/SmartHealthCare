const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  patient:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor:      { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  title:       { type: String, required: true },
  file_url:    { type: String },
  file_size:   { type: String },
  uploaded_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MedicalReport', reportSchema);
