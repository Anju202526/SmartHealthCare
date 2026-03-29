const express = require('express');
const router = express.Router();

const { getReports, downloadReport, saveReportRecord } = require('../controllers/medicalController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);
router.use(authorizeRoles('patient'));

router.get('/reports',                getReports);
router.get('/reports/:id/download',   downloadReport);
router.post('/reports/upload',        saveReportRecord);

module.exports = router;
