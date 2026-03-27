const { getPool, sql } = require('../config/database');

// GET /api/patients/dashboard
async function getDashboard(req, res) {
  const pool = getPool();
  try {
    const patientResult = await pool
      .request()
      .input('user_id', sql.Int, req.user.user_id)
      .query('SELECT patient_id FROM Patients WHERE user_id = @user_id');

    if (patientResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Patient record not found' });
    }

    const patientId = patientResult.recordset[0].patient_id;

    const upcomingCount = await pool
      .request()
      .input('patient_id', sql.Int, patientId)
      .query(`
        SELECT COUNT(*) AS cnt
        FROM Appointments
        WHERE patient_id = @patient_id
          AND status = 'upcoming'
          AND appointment_date >= CAST(GETUTCDATE() AS DATE)
      `);

    const lastVisit = await pool
      .request()
      .input('patient_id', sql.Int, patientId)
      .query(`
        SELECT TOP 1 appointment_date
        FROM Appointments
        WHERE patient_id = @patient_id AND status = 'completed'
        ORDER BY appointment_date DESC
      `);

    const metrics = await pool
      .request()
      .input('patient_id', sql.Int, patientId)
      .query(`
        SELECT TOP 1 *
        FROM HealthMetrics
        WHERE patient_id = @patient_id
        ORDER BY recorded_at DESC
      `);

    res.json({
      upcomingAppointments: upcomingCount.recordset[0].cnt,
      lastVisit: lastVisit.recordset[0]?.appointment_date || null,
      healthMetrics: metrics.recordset[0] || null,
    });
  } catch (err) {
    console.error('getDashboard error:', err);
    res.status(500).json({ error: 'Failed to load dashboard', details: err.message });
  }
}

// GET /api/patients/profile
async function getProfile(req, res) {
  const pool = getPool();
  try {
    const result = await pool
      .request()
      .input('user_id', sql.Int, req.user.user_id)
      .query(`
        SELECT p.*, u.email
        FROM Patients p
        JOIN Users u ON p.user_id = u.user_id
        WHERE p.user_id = @user_id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('getProfile error:', err);
    res.status(500).json({ error: 'Failed to load profile', details: err.message });
  }
}

// PUT /api/patients/profile
async function updateProfile(req, res) {
  const { first_name, last_name, phone, dob, gender, address, allergies, blood_type } =
    req.body;
  const pool = getPool();

  try {
    await pool
      .request()
      .input('user_id', sql.Int, req.user.user_id)
      .input('first_name', sql.NVarChar, first_name)
      .input('last_name', sql.NVarChar, last_name)
      .input('phone', sql.NVarChar, phone || null)
      .input('dob', sql.Date, dob || null)
      .input('gender', sql.NVarChar, gender || null)
      .input('address', sql.NVarChar, address || null)
      .input('allergies', sql.NVarChar, allergies || null)
      .input('blood_type', sql.NVarChar, blood_type || null)
      .query(`
        UPDATE Patients
        SET first_name = @first_name,
            last_name  = @last_name,
            phone      = @phone,
            dob        = @dob,
            gender     = @gender,
            address    = @address,
            allergies  = @allergies,
            blood_type = @blood_type,
            updated_at = GETUTCDATE()
        WHERE user_id = @user_id
      `);

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (err) {
    console.error('updateProfile error:', err);
    res.status(500).json({ error: 'Failed to update profile', details: err.message });
  }
}

// GET /api/patients/reports
async function getMedicalReports(req, res) {
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

    const reports = await pool
      .request()
      .input('patient_id', sql.Int, patientId)
      .query(`
        SELECT mr.report_id, mr.report_name, mr.report_type,
               mr.file_size, mr.upload_date, mr.blob_url,
               CONCAT(d.first_name, ' ', d.last_name) AS doctor_name
        FROM MedicalReports mr
        LEFT JOIN Doctors d ON mr.doctor_id = d.doctor_id
        WHERE mr.patient_id = @patient_id
        ORDER BY mr.upload_date DESC
      `);

    res.json(reports.recordset);
  } catch (err) {
    console.error('getMedicalReports error:', err);
    res.status(500).json({ error: 'Failed to load reports', details: err.message });
  }
}

// GET /api/patients/health-metrics
async function getHealthMetrics(req, res) {
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
        SELECT TOP 1 *
        FROM HealthMetrics
        WHERE patient_id = @patient_id
        ORDER BY recorded_at DESC
      `);

    res.json(result.recordset[0] || {});
  } catch (err) {
    console.error('getHealthMetrics error:', err);
    res.status(500).json({ error: 'Failed to load health metrics', details: err.message });
  }
}

module.exports = {
  getDashboard,
  getProfile,
  updateProfile,
  getMedicalReports,
  getHealthMetrics,
};
