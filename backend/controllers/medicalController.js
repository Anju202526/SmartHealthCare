const { getPool, sql } = require('../config/database');

// GET /api/medical/reports — patient's own reports
async function getReports(req, res) {
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
        SELECT mr.report_id,
               mr.report_name AS name,
               mr.report_type AS type,
               mr.file_size   AS size,
               CONVERT(VARCHAR(12), mr.upload_date, 106) AS date,
               CONCAT('Dr. ', d.first_name, ' ', d.last_name) AS doctor,
               mr.blob_url
        FROM MedicalReports mr
        LEFT JOIN Doctors d ON mr.doctor_id = d.doctor_id
        WHERE mr.patient_id = @patient_id
        ORDER BY mr.upload_date DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error('getReports error:', err);
    res.status(500).json({ error: 'Failed to load reports', details: err.message });
  }
}

// GET /api/medical/reports/:id/download — returns blob_url for the report
async function downloadReport(req, res) {
  const { id } = req.params;
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
      .input('report_id', sql.Int, id)
      .input('patient_id', sql.Int, patientId)
      .query(`
        SELECT blob_url, report_name
        FROM MedicalReports
        WHERE report_id = @report_id AND patient_id = @patient_id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // In production you would generate a short-lived SAS token here.
    // For now we return the stored URL directly.
    res.json({
      url: result.recordset[0].blob_url,
      name: result.recordset[0].report_name,
    });
  } catch (err) {
    console.error('downloadReport error:', err);
    res.status(500).json({ error: 'Failed to get download link', details: err.message });
  }
}

// POST /api/medical/reports/upload — save a report record after frontend uploads to Blob
async function saveReportRecord(req, res) {
  const { report_name, report_type, file_size, blob_url, doctor_id } = req.body;
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

    await pool
      .request()
      .input('patient_id', sql.Int, patientId)
      .input('doctor_id', sql.Int, doctor_id || null)
      .input('report_name', sql.NVarChar, report_name)
      .input('report_type', sql.NVarChar, report_type || 'General')
      .input('file_size', sql.NVarChar, file_size || null)
      .input('blob_url', sql.NVarChar, blob_url)
      .query(`
        INSERT INTO MedicalReports
          (patient_id, doctor_id, report_name, report_type, file_size, blob_url, upload_date)
        VALUES
          (@patient_id, @doctor_id, @report_name, @report_type, @file_size, @blob_url, GETUTCDATE())
      `);

    res.status(201).json({ success: true, message: 'Report record saved' });
  } catch (err) {
    console.error('saveReportRecord error:', err);
    res.status(500).json({ error: 'Failed to save report', details: err.message });
  }
}

module.exports = { getReports, downloadReport, saveReportRecord };
