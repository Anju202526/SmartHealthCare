const express = require('express');
const router = express.Router();

const {
  getDashboard,
  getProfile,
  updateProfile,
  getMedicalReports,
  getHealthMetrics,
} = require('../controllers/patientController');

const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All patient routes require authentication + patient role only
router.use(authenticateToken);
router.use(authorizeRoles('patient'));

router.get('/dashboard',       getDashboard);
router.get('/profile',         getProfile);
router.put('/profile',         updateProfile);
router.get('/reports',         getMedicalReports);
router.get('/health-metrics',  getHealthMetrics);

module.exports = router;
