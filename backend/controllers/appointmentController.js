const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

// GET /api/appointments/patient — all appointments for logged-in patient
async function getPatientAppointments(req, res) {
  try {
    const appointments = await Appointment.find({ patient: req.user.userId })
      .populate('doctor', 'name specialty')
      .sort({ date: -1 });

    const formatted = appointments.map(a => ({
      id:       a._id,
      doctor:   `Dr. ${a.doctor?.name || 'Unknown'}`,
      specialty: a.doctor?.specialty || '',
      date:     a.date,
      time:     a.time,
      type:     a.type,
      status:   a.status,
      fee:      `€${a.fee}`,
    }));

    res.json(formatted);
  } catch (err) {
    console.error('getPatientAppointments error:', err);
    res.status(500).json({ error: 'Failed to load appointments', details: err.message });
  }
}

// GET /api/appointments/upcoming — upcoming appointments for logged-in patient
async function getUpcomingAppointments(req, res) {
  try {
    const today = new Date().toISOString().split('T')[0];

    const appointments = await Appointment.find({
      patient: req.user.userId,
      status:  { $in: ['Upcoming', 'Confirmed'] },
      date:    { $gte: today },
    })
      .populate('doctor', 'name specialty')
      .sort({ date: 1, time: 1 })
      .limit(5);

    const formatted = appointments.map(a => ({
      id:       a._id,
      doctor:   `Dr. ${a.doctor?.name || 'Unknown'}`,
      specialty: a.doctor?.specialty || '',
      date:     a.date,
      time:     a.time,
      type:     a.type,
      status:   a.status,
      fee:      `€${a.fee}`,
    }));

    res.json(formatted);
  } catch (err) {
    console.error('getUpcomingAppointments error:', err);
    res.status(500).json({ error: 'Failed to load appointments', details: err.message });
  }
}

// POST /api/appointments/book
async function bookAppointment(req, res) {
  const { doctorId, date, time, consultationType, notes, fee } = req.body;

  try {
    // Check slot is still free
    const conflict = await Appointment.findOne({
      doctor: doctorId,
      date,
      time,
      status: { $in: ['Upcoming', 'Confirmed'] },
    });

    if (conflict) {
      return res.status(409).json({ error: 'This time slot is no longer available' });
    }

    const appointment = new Appointment({
      patient: req.user.userId,
      doctor:  doctorId,
      date,
      time,
      type:    consultationType || 'Video Call',
      notes:   notes || null,
      fee:     fee || 0,
      status:  'Upcoming',
    });

    await appointment.save();

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointmentId: appointment._id,
    });
  } catch (err) {
    console.error('bookAppointment error:', err);
    res.status(500).json({ error: 'Failed to book appointment', details: err.message });
  }
}

// PUT /api/appointments/:id/cancel
async function cancelAppointment(req, res) {
  const { id } = req.params;
  const { reason } = req.body;

  try {
    await Appointment.findByIdAndUpdate(id, {
      status:        'Cancelled',
      cancel_reason: reason || null,
    });

    res.json({ success: true, message: 'Appointment cancelled' });
  } catch (err) {
    console.error('cancelAppointment error:', err);
    res.status(500).json({ error: 'Failed to cancel appointment', details: err.message });
  }
}

// GET /api/appointments — admin: all appointments with optional filters
async function getAllAppointments(req, res) {
  const { status, doctorId, patientId, dateFrom, dateTo, limit } = req.query;

  try {
    const filter = {};
    if (status)    filter.status  = status;
    if (doctorId)  filter.doctor  = doctorId;
    if (patientId) filter.patient = patientId;
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = dateFrom;
      if (dateTo)   filter.date.$lte = dateTo;
    }

    const query = Appointment.find(filter)
      .populate('patient', 'name email')
      .populate('doctor',  'name specialty')
      .sort({ date: -1, time: -1 });

    if (limit) query.limit(parseInt(limit));

    const appointments = await query;

    const formatted = appointments.map((a, i) => ({
      id:               a._id,
      appointment_code: `APT-${String(i + 1001).padStart(4, '0')}`,
      patient:          a.patient?.name || 'Unknown',
      doctor:           `Dr. ${a.doctor?.name || 'Unknown'}`,
      date:             a.date,
      time:             a.time,
      type:             a.type,
      status:           a.status,
      fee:              `€${a.fee}`,
    }));

    res.json(formatted);
  } catch (err) {
    console.error('getAllAppointments error:', err);
    res.status(500).json({ error: 'Failed to load appointments', details: err.message });
  }
}

// GET /api/appointments/:id — appointment detail
async function getAppointmentDetails(req, res) {
  const { id } = req.params;

  try {
    const appointment = await Appointment.findById(id)
      .populate('patient', 'name email phone')
      .populate('doctor',  'name specialty');

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({
      id:           appointment._id,
      patient_name: appointment.patient?.name || 'Unknown',
      doctor_name:  `Dr. ${appointment.doctor?.name || 'Unknown'}`,
      specialty:    appointment.doctor?.specialty || '',
      date:         appointment.date,
      time:         appointment.time,
      type:         appointment.type,
      status:       appointment.status,
      notes:        appointment.notes,
      fee:          appointment.fee,
    });
  } catch (err) {
    console.error('getAppointmentDetails error:', err);
    res.status(500).json({ error: 'Failed to load appointment', details: err.message });
  }
}

module.exports = {
  getPatientAppointments,
  getUpcomingAppointments,
  bookAppointment,
  cancelAppointment,
  getAllAppointments,
  getAppointmentDetails,
};
