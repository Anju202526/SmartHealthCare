const MedicalReport = require('../models/MedicalReport');

// GET /api/medical/reports — patient's own reports
async function getReports(req, res) {
  try {
    const reports = await MedicalReport.find({ patient: req.user.userId })
      .populate('doctor', 'name')
      .sort({ uploaded_at: -1 });

    const formatted = reports.map(r => ({
      report_id: r._id,
      name:      r.title,
      type:      r.report_type || 'General',
      size:      r.file_size,
      date:      r.uploaded_at?.toDateString(),
      doctor:    r.doctor ? `Dr. ${r.doctor.name}` : 'Unknown',
      blob_url:  r.file_url,
    }));

    res.json(formatted);
  } catch (err) {
    console.error('getReports error:', err);
    res.status(500).json({ error: 'Failed to load reports', details: err.message });
  }
}

// GET /api/medical/reports/:id/download
async function downloadReport(req, res) {
  const { id } = req.params;

  try {
    const report = await MedicalReport.findOne({
      _id:     id,
      patient: req.user.userId,
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({
      url:  report.file_url,
      name: report.title,
    });
  } catch (err) {
    console.error('downloadReport error:', err);
    res.status(500).json({ error: 'Failed to get download link', details: err.message });
  }
}

// POST /api/medical/reports/upload
async function saveReportRecord(req, res) {
  const { report_name, report_type, file_size, blob_url, doctor_id } = req.body;

  try {
    const report = new MedicalReport({
      patient:     req.user.userId,
      doctor:      doctor_id || null,
      title:       report_name,
      report_type: report_type || 'General',
      file_size:   file_size  || null,
      file_url:    blob_url,
    });

    await report.save();

    res.status(201).json({ success: true, message: 'Report record saved' });
  } catch (err) {
    console.error('saveReportRecord error:', err);
    res.status(500).json({ error: 'Failed to save report', details: err.message });
  }
}

module.exports = { getReports, downloadReport, saveReportRecord };
