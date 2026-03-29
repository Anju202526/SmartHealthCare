const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  email:      { type: String, required: true, unique: true },
  password:   { type: String, required: true },
  role:       { type: String, enum: ['patient','doctor','admin'], default: 'patient' },
  phone:      { type: String, default: null },
  dob:        { type: Date,   default: null },
  gender:     { type: String, default: null },
  address:    { type: String, default: null },
  specialty:  { type: String, default: null },
  license_no: { type: String, default: null },
  is_active:  { type: Boolean, default: true },
  last_login: { type: Date,   default: null },
  created_at: { type: Date,   default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
