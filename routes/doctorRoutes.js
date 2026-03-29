const express = require('express');
const router  = express.Router();

const {
  getAllDoctors,
  getAvailableSlots,
  getDoctorDashboard,
  getTodayAppointments,
  getSchedule,
  getDoctorPatients,
  getAvailability,
  updateAvailability,
  updateAppointmentStatus,
} = require('../controllers/doctorController');

const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Shorthand middleware arrays
const isAuth   = [authenticateToken];
const isDoctor = [authenticateToken, authorizeRoles('doctor')];

// ── IMPORTANT: Named routes MUST come before /:id routes ──────────────────
// Express matches in declaration order; /:id/slots would swallow /dashboard
// etc. if declared first.

// ── Doctor-only named routes ──────────────────────────────────────────────
router.get('/dashboard',               ...isDoctor, getDoctorDashboard);
router.get('/appointments/today',      ...isDoctor, getTodayAppointments);
router.put('/appointments/:id/status', ...isDoctor, updateAppointmentStatus);
router.get('/schedule',                ...isDoctor, getSchedule);
router.get('/patients',                ...isDoctor, getDoctorPatients);
router.get('/availability',            ...isDoctor, getAvailability);
router.patch('/availability',          ...isDoctor, updateAvailability);

// ── Parameterised routes LAST (any authenticated user) ───────────────────
router.get('/',          ...isAuth, getAllDoctors);
router.get('/:id/slots', ...isAuth, getAvailableSlots);

module.exports = router;
