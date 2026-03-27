const { getPool, sql } = require('../config/database');

// GET /api/appointments/patient — all appointments for logged-in patient
async function getPatientAppointments(req, res) {
  const pool = getPool();
  try {
    const patientResult = await pool
      .request()
      .input('user_id', sql.Int, req.user.user_id)
      .query('SELECT patient_id FROM Patients WHERE user_id = @user_id');

    if (patientResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const patientId = patientResult.recordset[0].patient_id;

    const result = await pool
      .request()
      .input('patient_id', sql.Int, patientId)
      .query(`
        SELECT a.appointment_id AS id,
               CONCAT('Dr. ', d.first_name, ' ', d.last_name) AS doctor,
               d.specialty,
               CONVERT(VARCHAR(12), a.appointment_date, 106) AS date,
               CONVERT(VARCHAR(5),  a.appointment_time, 108)  AS time,
               a.consultation_type AS type,
               a.status,
               CONCAT('€', CAST(a.fee AS VARCHAR)) AS fee
        FROM Appointments a
        JOIN Doctors d ON a.doctor_id = d.doctor_id
        WHERE a.patient_id = @patient_id
        ORDER BY a.appointment_date DESC, a.appointment_time DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error('getPatientAppointments error:', err);
    res.status(500).json({ error: 'Failed to load appointments', details: err.message });
  }
}

// GET /api/appointments/upcoming — upcoming appointments for logged-in patient
async function getUpcomingAppointments(req, res) {
  const pool = getPool();
  try {
    const patientResult = await pool
      .request()
      .input('user_id', sql.Int, req.user.user_id)
      .query('SELECT patient_id FROM Patients WHERE user_id = @user_id');

    if (patientResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const patientId = patientResult.recordset[0].patient_id;

    const result = await pool
      .request()
      .input('patient_id', sql.Int, patientId)
      .query(`
        SELECT TOP 5
               a.appointment_id AS id,
               CONCAT('Dr. ', d.first_name, ' ', d.last_name) AS doctor,
               d.specialty,
               CONVERT(VARCHAR(12), a.appointment_date, 106) AS date,
               CONVERT(VARCHAR(5),  a.appointment_time, 108)  AS time,
               a.consultation_type AS type,
               a.status,
               CONCAT('€', CAST(a.fee AS VARCHAR)) AS fee
        FROM Appointments a
        JOIN Doctors d ON a.doctor_id = d.doctor_id
        WHERE a.patient_id = @patient_id
          AND a.status IN ('upcoming', 'confirmed')
          AND a.appointment_date >= CAST(GETUTCDATE() AS DATE)
        ORDER BY a.appointment_date, a.appointment_time
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error('getUpcomingAppointments error:', err);
    res.status(500).json({ error: 'Failed to load appointments', details: err.message });
  }
}

// POST /api/appointments/book
async function bookAppointment(req, res) {
  const {
    doctorId,
    date,          // "YYYY-MM-DD"
    time,          // "HH:MM"
    consultationType,
    notes,
    fee,
  } = req.body;

  const pool = getPool();
  try {
    const patientResult = await pool
      .request()
      .input('user_id', sql.Int, req.user.user_id)
      .query('SELECT patient_id FROM Patients WHERE user_id = @user_id');

    if (patientResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const patientId = patientResult.recordset[0].patient_id;

    // Check slot is still free
    const conflict = await pool
      .request()
      .input('doctor_id', sql.Int, doctorId)
      .input('date', sql.Date, date)
      .input('time', sql.NVarChar, time)
      .query(`
        SELECT appointment_id
        FROM Appointments
        WHERE doctor_id = @doctor_id
          AND appointment_date = @date
          AND appointment_time = @time
          AND status IN ('upcoming', 'confirmed')
      `);

    if (conflict.recordset.length > 0) {
      return res.status(409).json({ error: 'This time slot is no longer available' });
    }

    const result = await pool
      .request()
      .input('patient_id', sql.Int, patientId)
      .input('doctor_id', sql.Int, doctorId)
      .input('date', sql.Date, date)
      .input('time', sql.NVarChar, time)
      .input('consultation_type', sql.NVarChar, consultationType || 'Video Call')
      .input('reason', sql.NVarChar, notes || null)
      .input('fee', sql.Decimal(10, 2), fee || 0)
      .input('status', sql.NVarChar, 'upcoming')
      .query(`
        INSERT INTO Appointments
          (patient_id, doctor_id, appointment_date, appointment_time,
           consultation_type, reason, fee, status, created_at, updated_at)
        OUTPUT INSERTED.appointment_id
        VALUES
          (@patient_id, @doctor_id, @date, @time,
           @consultation_type, @reason, @fee, @status, GETUTCDATE(), GETUTCDATE())
      `);

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointmentId: result.recordset[0].appointment_id,
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
  const pool = getPool();

  try {
    await pool
      .request()
      .input('appointment_id', sql.Int, id)
      .input('cancel_reason', sql.NVarChar, reason || null)
      .query(`
        UPDATE Appointments
        SET status = 'cancelled',
            cancel_reason = @cancel_reason,
            updated_at = GETUTCDATE()
        WHERE appointment_id = @appointment_id
      `);

    res.json({ success: true, message: 'Appointment cancelled' });
  } catch (err) {
    console.error('cancelAppointment error:', err);
    res.status(500).json({ error: 'Failed to cancel appointment', details: err.message });
  }
}

// GET /api/appointments — admin: all appointments with optional filters
async function getAllAppointments(req, res) {
  const { status, doctorId, patientId, dateFrom, dateTo, limit } = req.query;
  const pool = getPool();

  try {
    const topClause = limit ? `TOP ${parseInt(limit)}` : '';

    let query = `
      SELECT ${topClause}
             a.appointment_id AS id,
             CONCAT('APT-', RIGHT('0000' + CAST(a.appointment_id AS VARCHAR), 4)) AS appointment_code,
             CONCAT(p.first_name, ' ', p.last_name) AS patient,
             CONCAT('Dr. ', d.first_name, ' ', d.last_name) AS doctor,
             CONVERT(VARCHAR(12), a.appointment_date, 106) AS date,
             CONVERT(VARCHAR(5),  a.appointment_time, 108)  AS time,
             a.consultation_type AS type,
             a.status,
             CONCAT('€', CAST(a.fee AS VARCHAR)) AS fee
      FROM Appointments a
      JOIN Patients p ON a.patient_id = p.patient_id
      JOIN Doctors  d ON a.doctor_id  = d.doctor_id
      WHERE 1=1
    `;

    const request = pool.request();

    if (status) {
      query += ' AND a.status = @status';
      request.input('status', sql.NVarChar, status);
    }
    if (doctorId) {
      query += ' AND a.doctor_id = @doctorId';
      request.input('doctorId', sql.Int, doctorId);
    }
    if (patientId) {
      query += ' AND a.patient_id = @patientId';
      request.input('patientId', sql.Int, patientId);
    }
    if (dateFrom) {
      query += ' AND a.appointment_date >= @dateFrom';
      request.input('dateFrom', sql.Date, dateFrom);
    }
    if (dateTo) {
      query += ' AND a.appointment_date <= @dateTo';
      request.input('dateTo', sql.Date, dateTo);
    }

    query += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error('getAllAppointments error:', err);
    res.status(500).json({ error: 'Failed to load appointments', details: err.message });
  }
}

// GET /api/appointments/:id — appointment detail
async function getAppointmentDetails(req, res) {
  const { id } = req.params;
  const pool = getPool();

  try {
    const result = await pool
      .request()
      .input('appointment_id', sql.Int, id)
      .query(`
        SELECT a.*,
               CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
               CONCAT('Dr. ', d.first_name, ' ', d.last_name) AS doctor_name,
               d.specialty
        FROM Appointments a
        JOIN Patients p ON a.patient_id = p.patient_id
        JOIN Doctors  d ON a.doctor_id  = d.doctor_id
        WHERE a.appointment_id = @appointment_id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json(result.recordset[0]);
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
