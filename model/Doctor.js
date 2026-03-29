const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  email:        { type: String, required: true, unique: true },
  specialty:    { type: String, required: true },
  fee:          { type: Number, default: 65 },
  available:    { type: Boolean, default: true },
  availability: { type: [String], default: ['Mon','Tue','Wed','Thu'] },
  created_at:   { type: Date, default: Date.now }
});

module.exports = mongoose.model('Doctor', doctorSchema);
