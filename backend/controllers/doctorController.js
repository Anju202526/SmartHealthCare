const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

// GET /api/doctors — list all doctors
async function getAllDoctors(req, res) {
  try {
    const doctors = await Doctor.find({ available: true }).sort({ name: 1 });

    const formatted = doctors.map(d => ({
      id:               d._id,
      doctor_id:        d._id,
      name:             `Dr. ${d.name}`,
      first_name:       d.name.split(' ')[0] || '',
      last_name:        d.name.split(' ').slice(1).join(' ') || '',
      specialty:        d.specialty,
      phone:            d.phone      || null,
      email:            d.email,
      experience:       d.experience || null,
      consultation_fee: d.fee,
    }));

    res.json(formatted);
  } catch (err) {
    console.error('getAllDoctors error:', err);
    res.status(500).json({ error: 'Failed to load doctors', details: err.message });
  }
}

// GET /api/doctors/:id/slots?date=YYYY-MM-DD
async function getAvailableSlots(req, res) {
  const { id } = req.params;
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: 'Date is required' });
  }

  try {
    // All possible time slots
    const allSlots = [
      '09:00','09:30','10:00','10:30','11:00','11:30',
      '12:00','14:00','14:30','15:00','15:30','16:00','16:30',
    ];

    // Find already booked slots for this doctor on this date
    const booked = await Appointment.find({
      doctor: id,
      date,
      status: { $in: ['Upcoming', 'Confirmed'] },
    }).select('time');

    const bookedTimes = booked.map(a => a.time);

    const slots = allSlots.map(time => ({
      time,
      available: !bookedTimes.includes(time),
    }));

    res.json({ date, doctorId: id, slots });
  } catch (err) {
    console.error('getAvailableSlots error:', err);
    res.status(500).json({ error: 'Failed to load slots', details: err.message });
  }
}

// GET /api/doctors/:id — single doctor details
async function getDoctorById(req, res) {
  const { id } = req.params;

  try {
    const doctor = await Doctor.findById(id);

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json({
      id:               doctor._id,
      name:             `Dr. ${doctor.name}`,
      specialty:        doctor.specialty,
      email:            doctor.email,
      phone:            doctor.phone      || null,
      fee:              doctor.fee,
      experience:       doctor.experience || null,
      availability:     doctor.availability,
      available:        doctor.available,
    });
  } catch (err) {
    console.error('getDoctorById error:', err);
    res.status(500).json({ error: 'Failed to load doctor', details: err.message });
  }
}

// GET /api/doctors/:id/schedule — doctor's own schedule
async function getDoctorSchedule(req, res) {
  const { id } = req.params;
  const { date } = req.query;

  try {
    const filter = { doctor: id };
    if (date) filter.date = date;

    const appointments = await Appointment.find(filter)
      .populate('patient', 'name email phone')
      .sort({ date: 1, time: 1 });

    const formatted = appointments.map(a => ({
      id:           a._id,
      patient_name: a.patient?.name  || 'Unknown',
      patient_email:a.patient?.email || '',
      date:         a.date,
      time:         a.time,
      type:         a.type,
      status:       a.status,
      notes:        a.notes,
      fee:          a.fee,
    }));

    res.json(formatted);
  } catch (err) {
    console.error('getDoctorSchedule error:', err);
    res.status(500).json({ error: 'Failed to load schedule', details: err.message });
  }
}

// PUT /api/doctors/:id/availability — update doctor availability
async function updateAvailability(req, res) {
  const { id } = req.params;
  const { availability, available } = req.body;

  try {
    await Doctor.findByIdAndUpdate(id, {
      ...(availability !== undefined && { availability }),
      ...(available   !== undefined && { available }),
    });

    res.json({ success: true, message: 'Availability updated successfully' });
  } catch (err) {
    console.error('updateAvailability error:', err);
    res.status(500).json({ error: 'Failed to update availability', details: err.message });
  }
}

module.exports = {
  getAllDoctors,
  getAvailableSlots,
  getDoctorById,
  getDoctorSchedule,
  updateAvailability,
};
