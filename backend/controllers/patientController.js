const User = require('../models/User');
const Appointment = require('../models/Appointment');
const MedicalReport = require('../models/MedicalReport');

// GET /api/patients/dashboard
async function getDashboard(req, res) {
  try {
    const today = new Date().toISOString().split('T')[0];

    const upcomingCount = await Appointment.countDocuments({
      patient: req.user.userId,
      status:  'Upcoming',
      date:    { $gte: today },
    });

    const lastVisit = await Appointment.findOne({
      patient: req.user.userId,
      status:  'Completed',
    }).sort({ date: -1 });

    const user = await User.findById(req.user.userId).select('-password');

    res.json({
      upcomingAppointments: upcomingCount,
      lastVisit:            lastVisit?.date || null,
      healthMetrics: {
        blood_pressure: '118/76',
        heart_rate:     72,
        glucose:        5.4,
        oxygen_sat:     98,
        cholesterol:    5.9,
      },
      patient: {
        name:       user.name,
        email:      user.email,
        blood_type: user.blood_type || null,
        allergies:  user.allergies  || null,
      },
    });
  } catch (err) {
    console.error('getDashboard error:', err);
    res.status(500).json({ error: 'Failed to load dashboard', details: err.message });
  }
}

// GET /api/patients/profile
async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user.userId).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const nameParts = user.name ? user.name.split(' ') : ['', ''];

    res.json({
      user_id:    user._id,
      email:      user.email,
      first_name: nameParts[0] || '',
      last_name:  nameParts.slice(1).join(' ') || '',
      phone:      user.phone,
      dob:        user.dob,
      gender:     user.gender,
      address:    user.address,
      allergies:  user.allergies,
      blood_type: user.blood_type,
    });
  } catch (err) {
    console.error('getProfile error:', err);
    res.status(500).json({ error: 'Failed to load profile', details: err.message });
  }
}

// PUT /api/patients/profile
async function updateProfile(req, res) {
  const { first_name, last_name, phone, dob, gender, address, allergies, blood_type } = req.body;

  try {
    await User.findByIdAndUpdate(req.user.userId, {
      name:       `${first_name} ${last_name}`.trim(),
      phone:      phone      || null,
      dob:        dob        || null,
      gender:     gender     || null,
      address:    address    || null,
      allergies:  allergies  || null,
      blood_type: blood_type || null,
    });

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (err) {
    console.error('updateProfile error:', err);
    res.status(500).json({ error: 'Failed to update profile', details: err.message });
  }
}

// GET /api/patients/reports
async function getMedicalReports(req, res) {
  try {
    const reports = await MedicalReport.find({ patient: req.user.userId })
      .populate('doctor', 'name')
      .sort({ uploaded_at: -1 });

    const formatted = reports.map(r => ({
      report_id:   r._id,
      report_name: r.title,
      file_size:   r.file_size,
      upload_date: r.uploaded_at,
      blob_url:    r.file_url,
      doctor_name: r.doctor?.name || 'Unknown',
    }));

    res.json(formatted);
  } catch (err) {
    console.error('getMedicalReports error:', err);
    res.status(500).json({ error: 'Failed to load reports', details: err.message });
  }
}

// GET /api/patients/heal      `);

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
