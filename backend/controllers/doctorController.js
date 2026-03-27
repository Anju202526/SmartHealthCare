const { getPool, sql } = require('../config/database');

// GET /api/doctors — list all doctors (used by booking page)
async function getAllDoctors(req, res) {
  const pool = getPool();
  try {
    const result = await pool.request().query(`
      SELECT
        d.doctor_id                                           AS id,
        d.doctor_id,
        CONCAT('Dr. ', d.first_name, ' ', d.last_name)       AS name,
        d.first_name,
        d.last_name,
        d.specialty,
        d.phone,
        d.email,
        d.experience,
        d.consultation_fee
      FROM Doctors d
      JOIN Users u ON d.user_id = u.user_id
      WHERE u.is_active = 1
      ORDER BY d.last_name
    `);
    res.json(result.recordset);
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
    return res.status(400).json({ error: 'date query parameter is required (YYYY-MM-DD)' });
  }

  const pool = getPool();
  try {
    // Get doctor availability settings
    const availResult = await pool
      .request()
      .input('doctor_id', sql.Int, id)
      .query(`
        SELECT start_time, end_time, slot_duration_mins, max_patients
        FROM DoctorAvailability
        WHERE doctor_id = @doctor_id
      `);

    // Get already-booked slots for that date
    const bookedResult = await pool
      .request()
      .input('doctor_id', sql.Int, id)
      .input('date', sql.Date, date)
      .query(`
        SELECT appointment_time
        FROM Appointments
        WHERE doctor_id = @doctor_id
          AND appointment_date = @date
          AND status IN ('upcoming', 'confirmed')
      `);

    const bookedTimes = bookedResult.recordset.map((r) =>
      r.appointment_time.substring(0, 5)
    );

    // Generate slots from availability or use defaults
    const avail = availResult.recordset[0];
    const startHour = avail ? parseInt(avail.start_time.split(':')[0]) : 9;
    const endHour = avail ? parseInt(avail.end_time.split(':')[0]) : 17;
    const duration = avail ? avail.slot_duration_mins : 30;

    const slots = [];
    let current = startHour * 60;
    const end = endHour * 60;

    while (current < end) {
      const hh = String(Math.floor(current / 60)).padStart(2, '0');
      const mm = String(current % 60).padStart(2, '0');
      const time = `${hh}:${mm}`;
      slots.push({ time, booked: bookedTimes.includes(time) });
      current += duration;
    }

    res.json(slots);
  } catch (err) {
    console.error('getAvailableSlots error:', err);
    res.status(500).json({ error: 'Failed to load slots', details: err.message });
  }
}

// GET /api/doctors/dashboard (doctor-only)
async function getDoctorDashboard(req, res) {
  const pool = getPool();
  try {
    const doctorResult = await pool
      .request()
      .input('user_id', sql.Int, req.user.user_id)
      .query('SELECT doctor_id FROM Doctors WHERE user_id = @user_id');

    if (doctorResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Doctor record not found' });
    }

    const doctorId = doctorResult.recordset[0].doctor_id;

    const todayCount = await pool
      .request()
      .input('doctor_id', sql.Int, doctorId)
      .query(`
        SELECT COUNT(*) AS cnt
        FROM Appointments
        WHERE doctor_id = @doctor_id
          AND appointment_date = CAST(GETUTCDATE() AS DATE)
          AND status IN ('upcoming', 'confirmed')
      `);

    const totalPatients = await pool
      .request()
      .input('doctor_id', sql.Int, doctorId)
      .query(`
        SELECT COUNT(DISTINCT patient_id) AS cnt
        FROM Appointments
        WHERE doctor_id = @doctor_id
      `);

    const weekCount = await pool
      .request()
      .input('doctor_id', sql.Int, doctorId)
      .query(`
        SELECT COUNT(*) AS cnt
        FROM Appointments
        WHERE doctor_id = @doctor_id
          AND appointment_date >= CAST(DATEADD(DAY, -DATEPART(WEEKDAY, GETUTCDATE()) + 1, GETUTCDATE()) AS DATE)
          AND appointment_date <  CAST(DATEADD(DAY, 8 - DATEPART(WEEKDAY, GETUTCDATE()), GETUTCDATE()) AS DATE)
      `);

    res.json({
      todayAppointments: todayCount.recordset[0].cnt,
      totalPatients: totalPatients.recordset[0].cnt,
      thisWeek: weekCount.recordset[0].cnt,
    });
  } catch (err) {
    console.error('getDoctorDashboard error:', err);
    res.status(500).json({ error: 'Failed to load dashboard', details: err.message });
  }
}

// GET /api/doctors/appointments/today
async function getTodayAppointments(req, res) {
  const pool = getPool();
  try {
    const doctorResult = await pool
      .request()
      .input('user_id', sql.Int, req.user.user_id)
      .query('SELECT doctor_id FROM Doctors WHERE user_id = @user_id');

    if (doctorResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const doctorId = doctorResult.recordset[0].doctor_id;

    const result = await pool
      .request()
      .input('doctor_id', sql.Int, doctorId)
      .query(`
        SELECT a.appointment_id,
               CONVERT(VARCHAR(5), a.appointment_time, 108) AS time,
               CONCAT(p.first_name, ' ', p.last_name) AS patient,
               a.reason, a.consultation_type AS type, a.status
        FROM Appointments a
        JOIN Patients p ON a.patient_id = p.patient_id
        WHERE a.doctor_id = @doctor_id
          AND a.appointment_date = CAST(GETUTCDATE() AS DATE)
        ORDER BY a.appointment_time
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error('getTodayAppointments error:', err);
    res.status(500).json({ error: 'Failed to load appointments', details: err.message });
  }
}

// GET /api/doctors/schedule?date=YYYY-MM-DD
async function getSchedule(req, res) {
  const { date } = req.query;
  const pool = getPool();

  try {
    const doctorResult = await pool
      .request()
      .input('user_id', sql.Int, req.user.user_id)
      .query('SELECT doctor_id FROM Doctors WHERE user_id = @user_id');

    if (doctorResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const doctorId = doctorResult.recordset[0].doctor_id;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const result = await pool
      .request()
      .input('doctor_id', sql.Int, doctorId)
      .input('date', sql.Date, targetDate)
      .query(`
        SELECT a.appointment_id,
               CONVERT(VARCHAR(5), a.appointment_time, 108) AS time,
               CONCAT(p.first_name, ' ', p.last_name) AS patient,
               p.patient_id,
               a.reason, a.consultation_type AS type, a.status
        FROM Appointments a
        JOIN Patients p ON a.patient_id = p.patient_id
        WHERE a.doctor_id = @doctor_id
          AND a.appointment_date = @date
        ORDER BY a.appointment_time
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error('getSchedule error:', err);
    res.status(500).json({ error: 'Failed to load schedule', details: err.message });
  }
}

// GET /api/doctors/patients
async function getDoctorPatients(req, res) {
  const pool = getPool();
  try {
    const doctorResult = await pool
      .request()
      .input('user_id', sql.Int, req.user.user_id)
      .query('SELECT doctor_id FROM Doctors WHERE user_id = @user_id');

    if (doctorResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const doctorId = doctorResult.recordset[0].doctor_id;

    const result = await pool
      .request()
      .input('doctor_id', sql.Int, doctorId)
      .query(`
        SELECT DISTINCT
               p.patient_id AS id,
               CONCAT('SC-', RIGHT('00000' + CAST(p.patient_id AS VARCHAR), 5)) AS patient_code,
               CONCAT(p.first_name, ' ', p.last_name) AS name,
               MAX(a.appointment_date) AS lastVisit,
               p.primary_condition AS condition,
               CASE WHEN MAX(a.status) = 'completed' THEN 'Discharged' ELSE 'Active' END AS status
        FROM Appointments a
        JOIN Patients p ON a.patient_id = p.patient_id
        WHERE a.doctor_id = @doctor_id
        GROUP BY p.patient_id, p.first_name, p.last_name, p.primary_condition
        ORDER BY MAX(a.appointment_date) DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error('getDoctorPatients error:', err);
    res.status(500).json({ error: 'Failed to load patients', details: err.message });
  }
}

// GET /api/doctors/availability
async function getAvailability(req, res) {
  const pool = getPool();
  try {
    const doctorResult = await pool
      .request()
      .input('user_id', sql.Int, req.user.user_id)
      .query('SELECT doctor_id FROM Doctors WHERE user_id = @user_id');

    if (doctorResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const doctorId = doctorResult.recordset[0].doctor_id;

    const result = await pool
      .request()
      .input('doctor_id', sql.Int, doctorId)
      .query('SELECT * FROM DoctorAvailability WHERE doctor_id = @doctor_id');

    res.json(result.recordset[0] || {});
  } catch (err) {
    console.error('getAvailability error:', err);
    res.status(500).json({ error: 'Failed to load availability', details: err.message });
  }
}

// PATCH /api/doctors/availability
async function updateAvailability(req, res) {
  const { start_time, end_time, slot_duration_mins, max_patients, days_available } =
    req.body;
  const pool = getPool();

  try {
    const doctorResult = await pool
      .request()
      .input('user_id', sql.Int, req.user.user_id)
      .query('SELECT doctor_id FROM Doctors WHERE user_id = @user_id');

    if (doctorResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const doctorId = doctorResult.recordset[0].doctor_id;

    // Upsert availability
    await pool
      .request()
      .input('doctor_id', sql.Int, doctorId)
      .input('start_time', sql.NVarChar, start_time)
      .input('end_time', sql.NVarChar, end_time)
      .input('slot_duration_mins', sql.Int, slot_duration_mins)
      .input('max_patients', sql.Int, max_patients)
      .input('days_available', sql.NVarChar, JSON.stringify(days_available))
      .query(`
        MERGE DoctorAvailability AS target
        USING (SELECT @doctor_id AS doctor_id) AS source ON target.doctor_id = source.doctor_id
        WHEN MATCHED THEN
          UPDATE SET start_time = @start_time, end_time = @end_time,
                     slot_duration_mins = @slot_duration_mins,
                     max_patients = @max_patients,
                     days_available = @days_available,
                     updated_at = GETUTCDATE()
        WHEN NOT MATCHED THEN
          INSERT (doctor_id, start_time, end_time, slot_duration_mins, max_patients, days_available, updated_at)
          VALUES (@doctor_id, @start_time, @end_time, @slot_duration_mins, @max_patients, @days_available, GETUTCDATE());
      `);

    res.json({ success: true, message: 'Availability updated successfully' });
  } catch (err) {
    console.error('updateAvailability error:', err);
    res.status(500).json({ error: 'Failed to update availability', details: err.message });
  }
}

// PUT /api/doctors/appointments/:id/status
async function updateAppointmentStatus(req, res) {
  const { id } = req.params;
  const { status, notes } = req.body;
  const pool = getPool();

  try {
    await pool
      .request()
      .input('appointment_id', sql.Int, id)
      .input('status', sql.NVarChar, status)
      .input('notes', sql.NVarChar, notes || null)
      .query(`
        UPDATE Appointments
        SET status = @status, doctor_notes = @notes, updated_at = GETUTCDATE()
        WHERE appointment_id = @appointment_id
      `);

    res.json({ success: true, message: 'Appointment status updated' });
  } catch (err) {
    console.error('updateAppointmentStatus error:', err);
    res.status(500).json({ error: 'Failed to update appointment', details: err.message });
  }
}

module.exports = {
  getAllDoctors,
  getAvailableSlots,
  getDoctorDashboard,
  getTodayAppointments,
  getSchedule,
  getDoctorPatients,
  getAvailability,
  updateAvailability,
  updateAppointmentStatus,
};
